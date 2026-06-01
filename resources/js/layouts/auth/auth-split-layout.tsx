import { Link } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
    className,
    rightContent,
}: AuthLayoutProps & { rightContent?: React.ReactNode }) {

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r overflow-hidden">
                <div className="absolute inset-0 bg-zinc-950" />
                <div className="absolute inset-0 z-10 flex items-center justify-center p-20">
                    {rightContent || (
                        <img
                            src="/images/rejestracja.png"
                            alt="Dobra Sztela"
                            className="h-full w-full object-contain"
                        />
                    )}
                </div>
                <Link
                    href={home()}
                    className="relative z-20 flex items-center text-lg font-medium"
                >
                    <AppLogoIcon className="mr-2 h-10" />
                </Link>
            </div>
            <div className="w-full lg:p-8">
                <div className={cn("mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]", className)}>
                    <Link
                        href={home()}
                        className="relative z-20 flex items-center justify-center lg:hidden"
                    >
                        <AppLogoIcon className="h-10 sm:h-12" />
                    </Link>
                    <div className="flex flex-col items-start gap-2 text-left sm:items-center sm:text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-sm text-balance text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
