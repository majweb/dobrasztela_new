import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const isDefaultLogo = user.avatar?.includes('default-firm.png');

    return (
        <>
            <div className={cn(
                "h-9 w-9 overflow-hidden transition-all flex items-center justify-center",
                isDefaultLogo ? "rounded-none bg-transparent" : "rounded-full bg-neutral-200"
            )}>
                {isDefaultLogo ? (
                    <img
                        src="/images/default-firm.png"
                        alt={user.name}
                        className="h-full w-full object-contain scale-150"
                    />
                ) : (
                    <Avatar className="h-full w-full">
                        <AvatarImage
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full object-cover"
                        />
                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                    </span>
                )}
            </div>
        </>
    );
}
