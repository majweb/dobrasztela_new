<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\AgencyCard;
use App\Models\AgencyDetail;
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
            'companyWebsite' => ['required', 'url', 'max:255'],
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
                'consents.*' => ['accepted'],
            ]);
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
        } else {
            $rules['name'] = $this->nameRules();
        }

        Validator::make($input, $rules)->validate();

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
                $imagePath = null;
                if (isset($input['fileuploadCard']) && $input['fileuploadCard'] instanceof UploadedFile) {
                    $imagePath = $input['fileuploadCard']->store('agency/'.$user->id, 'public');

                    // Dodatkowo ustawiamy avatar dla użytkownika, aby był widoczny w dashboardzie
                    $user->update([
                        'avatar' => Storage::disk('public')->url($imagePath)
                    ]);
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
                    'companyWebsite' => $input['companyWebsite'],
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

            return $user;
        });
    }
}
