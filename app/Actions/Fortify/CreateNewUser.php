<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\AgencyCard;
use App\Models\AgencyDetail;
use App\Models\CarrierCard;
use App\Models\CarrierDetail;
use App\Models\Consent;
use App\Models\SitterDetail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Zwraca reguły walidacji dla pierwszego kroku rejestracji agencji.
     *
     * @return array<string, mixed>
     */
    public function agencyStepOneRules(): array
    {
        return [
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
            'firstName' => ['required', 'string', 'min:3', 'max:255'],
            'lastName' => ['required', 'string', 'min:3', 'max:255'],
            'phone' => ['required', 'regex:/^[0-9\s\-]+$/', 'unique:agency_details,phone'],
            'companyEmailApplication' => ['required', 'email', 'max:255', $this->uniqueEmailRule()],
            'companyWebsite' => ['required', 'string', 'max:255'],
            'fileuploadCard' => ['nullable', 'image', 'max:5120'], // 5MB
        ];
    }

    /**
     * Zwraca reguły walidacji dla pierwszego kroku rejestracji przewoźnika.
     *
     * @return array<string, mixed>
     */
    public function carrierStepOneRules(): array
    {
        return [
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
            'firstName' => ['required', 'string', 'min:3', 'max:255'],
            'lastName' => ['required', 'string', 'min:3', 'max:255'],
            'phone' => ['required', 'regex:/^[0-9\s\-]+$/', 'unique:carrier_details,phone'],
            'companyWebsite' => ['required', 'string', 'max:255', 'regex:/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/'],
            'buyTicketWebsite' => ['nullable', 'string', 'max:255', 'regex:/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/'],
            'fileuploadCard' => ['nullable', 'image', 'max:5120'], // 5MB
        ];
    }

    /**
     * Waliduje pierwszy krok rejestracji (obecnie tylko dla agencji).
     */
    public function validateStepOne(Request $request): Response|RedirectResponse|JsonResponse
    {
        $input = $request->all();

        // Wymuszamy rolę agencji dla tej walidacji, jeśli nie została podana
        // W przyszłości możemy tu dodać logikę dla innych ról
        $input['role_id'] = $input['role_id'] ?? 2;

        if ((int) $input['role_id'] === 2) {
            Validator::make($input, $this->agencyStepOneRules())->validate();
            $request->session()->put('registration_password', $input['password'] ?? null);
        }

        if ((int) $input['role_id'] === 5) {
            Validator::make($input, $this->carrierStepOneRules())->validate();
            $request->session()->put('registration_password', $input['password'] ?? null);
        }

        if ($request->header('X-Inertia')) {
            return back();
        }

        return response()->json(['success' => true]);
    }

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        // Jeśli brakuje hasła, spróbuj pobrać je z sesji (dla agencji krok 2)
        if (empty($input['password']) && session()->has('registration_password')) {
            $input['password'] = session()->get('registration_password');
            $input['password_confirmation'] = session()->get('registration_password');
            session()->forget('registration_password');
        }

        $rules = [
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
            'role_id' => ['required', 'in:2,3,5'], // agency, sitter, carrier
        ];

        // Reguły wspólne dla ról wymagających zgód (2, 3, 5)
        if (isset($input['role_id']) && in_array((int) $input['role_id'], [2, 3, 5])) {
            $rules = array_merge($rules, [
                'consents' => ['required', 'array'],
            ]);

            // Pobieramy wymagane zgody dla danej roli, aby wymusić ich walidację
            $roleTypeMap = [
                2 => 'Rejestracja pracodawcy',
                3 => 'Rejestracja opiekunki',
                5 => 'Aplikacja do wielu',
            ];

            $type = $roleTypeMap[(int) $input['role_id']] ?? null;

            if ($type) {
                $requiredConsentIds = Consent::where('type', $type)
                    ->where('required', 1)
                    ->pluck('id')
                    ->toArray();

                foreach ($requiredConsentIds as $id) {
                    $rules["consents.{$id}"] = ['accepted'];
                }
            }

            // Obsługa pozostałych zgód, które zostały przesłane (np. opcjonalnych)
            if (isset($input['consents']) && is_array($input['consents'])) {
                foreach ($input['consents'] as $key => $value) {
                    if (!isset($rules["consents.{$key}"])) {
                        $rules["consents.{$key}"] = ['boolean'];
                    }
                }
            }
        }

        // Reguły dla Agencji (rola 2)
        if (isset($input['role_id']) && (int) $input['role_id'] === 2) {
            $rules = array_merge($rules, $this->agencyStepOneRules(), [
                'name' => ['required', 'string', 'max:30'], // Nazwa firmy (do AgencyCard i rekrutera)
                'invoiceName' => ['required', 'string', 'min:3', 'max:255'],
                'invoiceNip' => ['required', 'string', 'unique:agency_details,invoiceNip'],
                'invoiceRegon' => ['nullable', 'string', 'max:255'],
                'invoiceAddressStreet' => ['required', 'string', 'max:255'],
                'invoiceAddressPostalCode' => ['required', 'regex:/^[0-9a-zA-Z-]{5,6}$/'],
                'invoiceAddressPlace' => ['required', 'string', 'max:255'],
                'invoiceAddressCountry' => ['required', 'string', 'max:255'],
            ]);
        } elseif (isset($input['role_id']) && (int) $input['role_id'] === 5) {
            // Reguły dla Przewoźnika (rola 5)
            $rules = array_merge($rules, $this->carrierStepOneRules(), [
                'name' => ['required', 'string', 'max:60'], // Nazwa firmy
                'invoiceName' => ['required', 'string', 'min:3', 'max:255'],
                'invoiceNip' => ['required', 'string', 'unique:carrier_details,invoiceNip'],
                'invoiceRegon' => ['nullable', 'string', 'max:255'],
                'invoiceAddressStreet' => ['required', 'string', 'max:255'],
                'invoiceAddressPostalCode' => ['required', 'regex:/^[0-9a-zA-Z-]{5,6}$/'],
                'invoiceAddressPlace' => ['required', 'string', 'max:255'],
                'invoiceAddressCountry' => ['required', 'string', 'max:255'],
            ]);
        } elseif (isset($input['role_id']) && (int) $input['role_id'] === 3) {
            // Reguły dla Opiekuna (rola 3)
            $rules = array_merge($rules, [
                'firstName' => ['required', 'string', 'max:255'],
                'lastName' => ['required', 'string', 'max:255'],
                'phone' => ['required', 'string', 'max:255'],
                'de' => ['required', 'array'],
                'de.type' => ['required', 'string', 'in:de,other'],
                'de.value' => ['required_if:de.type,de'],
                'other' => ['required_if:de.type,other', 'array'],
                'region' => ['required_unless:otherCountry,true'],
                'regionText' => ['required_if:otherCountry,true', 'nullable', 'string', 'max:255'],
            ]);
        } else {
            $rules['name'] = $this->nameRules();
        }

        Validator::make($input, $rules, [
            'region.required_unless' => 'Pole region jest wymagane, gdy inny kraj nie jest zaznaczony.',
            'regionText.required_if' => 'Pole kraj, miejscowość jest wymagane, gdy inny kraj jest zaznaczony.',
            'consents.required' => 'Ta zgoda jest wymagana.',
            'consents.*.accepted' => 'Ta zgoda jest wymagana.',
            'consents.*.required' => 'Ta zgoda jest wymagana.',
        ])->validate();

        return DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
                'role_id' => $input['role_id'],
                'status' => (int) $input['role_id'] === 2 ? 'active' : 'notActive',
            ]);

            if ((int) $input['role_id'] === 2) {
                // Obsługa logotypu
                $imagePath = 'default-firm.png';
                if (isset($input['fileuploadCard']) && $input['fileuploadCard'] instanceof UploadedFile) {
                    $imagePath = $input['fileuploadCard']->store('agency/'.$user->id, 'public');
                }

                // Dodajemy https:// do strony www jeśli go nie ma
                $companyWebsite = $input['companyWebsite'] ?? '';
                if ($companyWebsite && !str_starts_with($companyWebsite, 'http')) {
                    $companyWebsite = 'https://' . $companyWebsite;
                }

                // Tworzenie AgencyDetail
                AgencyDetail::create([
                    'user_id' => $user->id,
                    'firstName' => $input['firstName'],
                    'lastName' => $input['lastName'],
                    'phone' => $input['phone'],
                    'invoiceName' => $input['invoiceName'],
                    'invoiceNip' => $input['invoiceNip'],
                    'invoiceRegon' => $input['invoiceRegon'] ?? null,
                    'invoiceAddressStreet' => $input['invoiceAddressStreet'],
                    'invoiceAddressPostalCode' => $input['invoiceAddressPostalCode'],
                    'invoiceAddressPlace' => $input['invoiceAddressPlace'],
                    'invoiceAddressCountry' => $input['invoiceAddressCountry'],
                ]);

                // Tworzenie AgencyCard
                $slug = Str::slug($input['name']);
                $checkSlug = AgencyCard::where('slug', $slug)->count();
                if ($checkSlug) {
                    $slug .= '-'.($checkSlug + 1);
                }

                AgencyCard::create([
                    'user_id' => $user->id,
                    'name' => $input['name'],
                    'slug' => $slug,
                    'fileuploadCard' => $imagePath,
                    'companyAddressStreet' => $input['invoiceAddressStreet'],
                    'companyAddressPostalCode' => $input['invoiceAddressPostalCode'],
                    'companyAddressPlace' => $input['invoiceAddressPlace'],
                    'companyAddressCountry' => $input['invoiceAddressCountry'],
                    'companyEmail' => $input['email'],
                    'companyEmailApplication' => $input['companyEmailApplication'],
                    'companyWebsite' => $companyWebsite,
                    'companyMobile1' => $input['phone'],
                ]);

                // Tworzenie głównego rekrutera (jak w ds)
                $recruitEmailGenerate = 'main-'.$user->id.'@'.Str::slug($input['name']).'.pl';
                User::create([
                    'name' => $input['firstName'].' '.$input['lastName'],
                    'email' => $recruitEmailGenerate,
                    'role_id' => 4, // recruit
                    'agency_id' => $user->id,
                    'password' => Hash::make($input['password']),
                    'status' => 'active',
                ]);
            }

            if ((int) $input['role_id'] === 5) {
                // Obsługa logotypu
                $imagePath = 'default.png';
                if (isset($input['fileuploadCard']) && $input['fileuploadCard'] instanceof UploadedFile) {
                    $imagePath = $input['fileuploadCard']->store('carrier/'.$user->id, 'public');
                }

                // Dodajemy https:// do stron www jeśli ich nie ma
                $companyWebsite = $input['companyWebsite'] ?? '';
                if ($companyWebsite && !str_starts_with($companyWebsite, 'http')) {
                    $companyWebsite = 'https://' . $companyWebsite;
                }

                $buyTicketWebsite = $input['buyTicketWebsite'] ?? '';
                if ($buyTicketWebsite && !str_starts_with($buyTicketWebsite, 'http')) {
                    $buyTicketWebsite = 'https://' . $buyTicketWebsite;
                }

                // Tworzenie CarrierDetail
                CarrierDetail::create([
                    'user_id' => $user->id,
                    'firstName' => $input['firstName'],
                    'lastName' => $input['lastName'],
                    'phone' => $input['phone'],
                    'invoiceName' => $input['invoiceName'],
                    'invoiceNip' => $input['invoiceNip'],
                    'invoiceRegon' => $input['invoiceRegon'] ?? null,
                    'invoiceAddressStreet' => $input['invoiceAddressStreet'],
                    'invoiceAddressPostalCode' => $input['invoiceAddressPostalCode'],
                    'invoiceAddressPlace' => $input['invoiceAddressPlace'],
                    'invoiceAddressCountry' => $input['invoiceAddressCountry'],
                ]);

                // Tworzenie CarrierCard
                $slug = Str::slug($input['name']);
                $checkSlug = CarrierCard::where('slug', $slug)->count();
                if ($checkSlug) {
                    $slug .= '-'.($checkSlug + 1);
                }

                CarrierCard::create([
                    'user_id' => $user->id,
                    'name' => $input['name'],
                    'slug' => $slug,
                    'fileuploadCard' => $imagePath,
                    'companyAddressStreet' => $input['invoiceAddressStreet'],
                    'companyAddressPostalCode' => $input['invoiceAddressPostalCode'],
                    'companyAddressPlace' => $input['invoiceAddressPlace'],
                    'companyAddressCountry' => $input['invoiceAddressCountry'],
                    'companyEmail' => $input['email'],
                    'companyWebsite' => $companyWebsite,
                    'buyTicketWebsite' => $buyTicketWebsite,
                    'companyMobile1' => $input['phone'],
                ]);
            }

            if ((int) $input['role_id'] === 3) {
                // Dodatkowe dane dla opiekuna zapisujemy w tabeli sitter_details
                SitterDetail::create([
                    'user_id'   => $user->id,
                    'firstName' => $input['firstName'] ?? null,
                    'lastName'  => $input['lastName'] ?? null,
                    'phone'     => $input['phone'] ?? null,
                    'de'        => $input['de']['type'] === 'de' ? (string) $input['de']['value'] : '1',
                    'other'     => $input['de']['type'] === 'other' ? $input['other'] : [],
                    'region'    => (string) ($input['otherCountry'] ? ($input['regionText'] ?: '') : ($input['region'] ?: '')),
                ]);

                $user->update([
                    'phone' => $input['phone'] ?? null,
                ]);
            }

            return $user;
        });
    }
}
