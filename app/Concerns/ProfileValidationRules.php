<?php

namespace App\Concerns;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

trait ProfileValidationRules
{
    /**
     * Get the validation rules used to validate user profiles.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function profileRules(?int $userId = null): array
    {
        return [
            'name' => $this->nameRules(),
            'email' => $this->emailRules($userId),
        ];
    }

    /**
     * Get the validation rules used to validate user names.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function nameRules(): array
    {
        return ['required', 'string', 'max:255'];
    }

    /**
     * Get the validation rules used to validate user emails.
     *
     * @return array<int, ValidationRule|array<mixed>|string>
     */
    protected function emailRules(?int $userId = null): array
    {
        return [
            'required',
            'string',
            'email',
            'max:255',
            'confirmed',
            $this->uniqueEmailRule($userId),
        ];
    }

    /**
     * Custom rule for cross-column unique email validation.
     */
    protected function uniqueEmailRule(?int $userId = null, array $additionalColumns = ['email', 'companyEmailApplication']): \Closure
    {
        return function ($attribute, $value, $fail) use ($userId, $additionalColumns) {
            $query = DB::table('users')
                ->leftJoin('agency_cards', 'users.id', '=', 'agency_cards.user_id')
                ->where(function ($q) use ($value, $additionalColumns) {
                    foreach ($additionalColumns as $column) {
                        if ($column === 'email') {
                            $q->orWhere('users.email', $value);
                        } else {
                            $q->orWhere('agency_cards.'.$column, $value);
                        }
                    }
                });

            if ($userId) {
                $query->where('users.id', '<>', $userId);
            }

            if ($query->exists()) {
                $fail(__('validation.unique', ['attribute' => $attribute]));
            }
        };
    }
}
