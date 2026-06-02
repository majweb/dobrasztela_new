import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { cn } from '@/lib/utils';

export default function AppLogo() {
    const { auth } = usePage().props;

    return (
        <>
            <div className={cn(
                "flex aspect-square size-10 items-center justify-center rounded-md overflow-hidden transition-all",
                auth.user?.avatar?.includes('default-firm.png') ? "bg-transparent size-11" : "size-15 text-sidebar-primary-foreground"
            )}>
                {auth.user?.avatar ? (
                    <img src={auth.user?.avatar?.includes('default-firm.png') ? '/images/default-firm.png' : auth.user.avatar} alt="Logo" className={cn(
                        "h-full w-full object-contain",
                        auth.user?.avatar?.includes('default-firm.png') && "scale-150"
                    )} />
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
