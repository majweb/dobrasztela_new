import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({
    title = '',
    description = '',
    className = '',
    rightContent,
    children,
}: {
    title?: string;
    description?: string;
    className?: string;
    rightContent?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description} className={className} rightContent={rightContent}>
            {children}
        </AuthLayoutTemplate>
    );
}
