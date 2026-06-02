import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { auth } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {auth.user?.avatar ? (
                    <img src={auth.user.avatar} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                    <AppLogoIcon className="size-5" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {auth.user?.role_id === 2 && auth.user?.name ? auth.user.name : 'Dobra Sztela'}
                </span>
            </div>
        </>
    );
}
