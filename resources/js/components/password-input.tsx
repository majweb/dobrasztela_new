import { Eye, EyeOff, KeyRound } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface PasswordInputProps extends Omit<ComponentProps<'input'>, 'type'> {
    ref?: Ref<HTMLInputElement>;
    onGenerate?: (password: string) => void;
}

export default function PasswordInput({
    className,
    ref,
    onGenerate,
    ...props
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    const generatePassword = () => {
        const length = 16;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
        let retVal = '';

        for (let i = 0, n = charset.length; i < length; ++i) {
            retVal += charset.charAt(Math.floor(Math.random() * n));
        }

        if (onGenerate) {
            onGenerate(retVal);
            setShowPassword(true);
        }
    };

    const strength = useMemo(() => {
        const password = (props.value as string) || '';

        if (!password) {
            return 0;
        }

        let score = 0;

        if (password.length >= 8) {
            score += 25;
        }

        if (password.length >= 12) {
            score += 10;
        }

        if (/[A-Z]/.test(password)) {
            score += 15;
        }

        if (/[a-z]/.test(password)) {
            score += 15;
        }

        if (/[0-9]/.test(password)) {
            score += 15;
        }

        if (/[^A-Za-z0-9]/.test(password)) {
            score += 20;
        }

        return Math.min(score, 100);
    }, [props.value]);

    const strengthColor = useMemo(() => {
        if (strength < 30) {
            return 'bg-destructive';
        }

        if (strength < 70) {
            return 'bg-yellow-500';
        }

        return 'bg-green-500';
    }, [strength]);

    const strengthText = useMemo(() => {
        if (strength === 0) {
            return '';
        }

        if (strength < 30) {
            return 'Słabe';
        }

        if (strength < 70) {
            return 'Średnie';
        }

        return 'Silne';
    }, [strength]);

    return (
        <div className="space-y-2">
            <div className="relative group">
                <Input
                    type={showPassword ? 'text' : 'password'}
                    className={cn('pr-20', className)}
                    ref={ref}
                    {...props}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                    {onGenerate && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={generatePassword}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            title="Generuj hasło"
                        >
                            <KeyRound className="size-4" />
                        </Button>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:ring-ring focus-visible:outline-none"
                        aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                </div>
            </div>

            {props.value && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        <span>Siła hasła</span>
                        <span>{strengthText}</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className={cn('h-full transition-all duration-300', strengthColor)}
                            style={{ width: `${strength}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
