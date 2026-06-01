import { Head, useForm, router } from '@inertiajs/react';
import { Briefcase, Car, Upload, User, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store, validateStep1 } from '@/routes/register';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const [step, setStep] = useState(1);
    const [isValidating, setIsValidating] = useState(false);

    // Stan dla przycinania obrazu
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const { data, setData, post, processing, errors, clearErrors, setError } = useForm({
        name: '',
        email: '',
        email_confirmation: '',
        password: '',
        password_confirmation: '',
        role_id: '3', // Domyślnie Sitter
        firstName: '',
        lastName: '',
        phone: '',
        companyEmailApplication: '',
        companyWebsite: '',
        fileuploadCard: null as File | null,
        invoiceName: '',
        invoiceNip: '',
        invoiceRegon: '',
        invoiceAddressStreet: '',
        invoiceAddressPostalCode: '',
        invoiceAddressPlace: '',
        invoiceAddressCountry: 'Polska',
        agree: false,
        politicy: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.role_id === '2' && step === 1) {
            clearErrors();

            router.post(validateStep1().url, data, {
                forceFormData: true,
                onStart: () => setIsValidating(true),
                onFinish: () => setIsValidating(false),
                onSuccess: () => setStep(2),
                onError: (errorsFromServer) => {
                    // Ponieważ używamy router.post bezpośrednio, a nie form.post,
                    // musimy ręcznie zsynchronizować błędy z obiektem useForm
                    Object.keys(errorsFromServer).forEach((key) => {
                        // @ts-expect-error key is string
                        setError(key, errorsFromServer[key]);
                    });
                },
            });

            return;
        }

        post(store().url);
    };

    const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImgSrc(reader.result?.toString() || '');
                setIsSelectDialogOpen(true);
            });
            reader.readAsDataURL(file);
        }
    };

    const handleNoCrop = () => {
        if (selectedFile) {
            setData('fileuploadCard', selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }

        setIsSelectDialogOpen(false);
    };

    const handleCropOpen = () => {
        setIsSelectDialogOpen(false);
        setIsCropDialogOpen(true);
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // Kwadratowy aspect ratio
                width,
                height
            ),
            width,
            height
        );
        setCrop(initialCrop);
    };

    const handleCropConfirm = async () => {
        if (!imgRef.current || !completedCrop) {
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.drawImage(
                imgRef.current,
                completedCrop.x * scaleX,
                completedCrop.y * scaleY,
                completedCrop.width * scaleX,
                completedCrop.height * scaleY,
                0,
                0,
                completedCrop.width,
                completedCrop.height
            );

            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'logo.png', { type: 'image/png' });
                    setData('fileuploadCard', file);
                    setPreviewUrl(URL.createObjectURL(blob));
                }
            }, 'image/png');
        }

        setIsCropDialogOpen(false);
    };

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <Head title="Zarejestruj się" />
            <form onSubmit={submit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    {step === 1 && (
                        <div className="grid gap-2">
                            <Label>Typ konta</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setData('role_id', '3')}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-brand-light-pink hover:shadow-sm ${
                                        data.role_id === '3' ? 'border-primary bg-brand-light-pink shadow-sm ring-4 ring-primary/10' : 'border-border bg-card'
                                    }`}
                                >
                                    <User className={`h-8 w-8 transition-colors ${data.role_id === '3' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-xs font-semibold transition-colors ${data.role_id === '3' ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Opiekun/ka
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('role_id', '2')}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-brand-light-pink hover:shadow-sm ${
                                        data.role_id === '2' ? 'border-primary bg-brand-light-pink shadow-sm ring-4 ring-primary/10' : 'border-border bg-card'
                                    }`}
                                >
                                    <Briefcase className={`h-8 w-8 transition-colors ${data.role_id === '2' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-xs font-semibold transition-colors ${data.role_id === '2' ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Agencja
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData('role_id', '5')}
                                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-brand-light-pink hover:shadow-sm ${
                                        data.role_id === '5' ? 'border-primary bg-brand-light-pink shadow-sm ring-4 ring-primary/10' : 'border-border bg-card'
                                    }`}
                                >
                                    <Car className={`h-8 w-8 transition-colors ${data.role_id === '5' ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <span className={`text-xs font-semibold transition-colors ${data.role_id === '5' ? 'text-primary' : 'text-muted-foreground'}`}>
                                        Przewoźnik
                                    </span>
                                </button>
                            </div>
                            <InputError message={errors.role_id} />
                        </div>
                    )}

                    {data.role_id === '2' ? (
                        <>
                            {step === 1 ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">Imię*</Label>
                                            <Input
                                                id="firstName"
                                                value={data.firstName}
                                                onChange={(e) => setData('firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Nazwisko*</Label>
                                            <Input
                                                id="lastName"
                                                value={data.lastName}
                                                onChange={(e) => setData('lastName', e.target.value)}
                                            />
                                        </div>
                                        {(errors.firstName || errors.lastName) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.firstName} />
                                                <InputError message={errors.lastName} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email*</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email_confirmation">Powtórz email*</Label>
                                            <Input
                                                id="email_confirmation"
                                                type="email"
                                                value={data.email_confirmation}
                                                onChange={(e) => setData('email_confirmation', e.target.value)}
                                            />
                                        </div>
                                        {(errors.email || errors.email_confirmation) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.email} />
                                                <InputError message={errors.email_confirmation} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2 pb-4">
                                        <Label htmlFor="companyEmailApplication">E-mail do aplikacji*</Label>
                                        <Input
                                            id="companyEmailApplication"
                                            type="email"
                                            value={data.companyEmailApplication}
                                            onChange={(e) => setData('companyEmailApplication', e.target.value)}
                                        />
                                        <InputError message={errors.companyEmailApplication} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Hasło*</Label>
                                            <PasswordInput
                                                id="password"
                                                value={data.password}
                                                onChange={(e) => {
                                                    const newPassword = e.target.value;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        password: newPassword,
                                                        password_confirmation: newPassword,
                                                    }));
                                                }}
                                                autoComplete="new-password"
                                                passwordrules={passwordRules}
                                                onGenerate={(password) => {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        password,
                                                        password_confirmation: password,
                                                    }));
                                                }}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="password_confirmation">Powtórz hasło*</Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                autoComplete="new-password"
                                                passwordrules={passwordRules}
                                            />
                                        </div>
                                        {(errors.password || errors.password_confirmation) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.password} />
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Numer telefonu*</Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="companyWebsite">Strona www*</Label>
                                            <Input
                                                id="companyWebsite"
                                                value={data.companyWebsite}
                                                onChange={(e) => setData('companyWebsite', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                        {(errors.phone || errors.companyWebsite) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.phone} />
                                                <InputError message={errors.companyWebsite} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2 pb-4">
                                        <Label htmlFor="fileuploadCard">Logo*</Label>
                                        <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-brand-light-pink/50 p-6 transition-all hover:border-primary/30 hover:bg-brand-light-pink">
                                            <Input
                                                id="fileuploadCard"
                                                type="file"
                                                onChange={onSelectFile}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            {data.fileuploadCard ? (
                                                <div className="flex w-full items-center justify-between gap-4 rounded-lg bg-card p-2 shadow-sm border">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/5 overflow-hidden border">
                                                            {previewUrl ? (
                                                                <img src={previewUrl} alt="Preview" className="h-full w-full object-contain" />
                                                            ) : (
                                                                <Upload className="h-5 w-5 text-primary" />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="truncate text-sm font-semibold">{data.fileuploadCard.name}</span>
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                                                                {(data.fileuploadCard.size / (1024 * 1024)).toFixed(2)} MB
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setData('fileuploadCard', null);
                                                            setPreviewUrl('');
                                                        }}
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => document.getElementById('fileuploadCard')?.click()}
                                                    className="flex cursor-pointer flex-col items-center gap-2"
                                                >
                                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                                                        <Upload className="h-6 w-6 text-primary" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-sm font-bold text-primary">Dodaj logotyp agencji</span>
                                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG do 5MB</p>
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                        <InputError message={errors.fileuploadCard} />
                                    </div>

                                    <div className="mt-6 flex flex-col items-center gap-4">
                                        <div className="flex w-full items-center gap-4">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Krok 1/2</span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <Button type="submit" className="w-full py-6 text-lg font-bold uppercase" disabled={isValidating}>
                                            {isValidating && <Spinner />}
                                            Dalej
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col items-center gap-2 mb-2">
                                        <span className="text-sm font-bold uppercase tracking-widest text-primary/80">Dane do faktury</span>
                                        <div className="h-1.5 w-16 rounded-full bg-brand-light-pink" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceName">Nazwa firmy*</Label>
                                            <Input
                                                id="invoiceName"
                                                value={data.invoiceName}
                                                onChange={(e) => {
                                                    setData('invoiceName', e.target.value);

                                                    if (!data.name) {
                                                        setData('name', e.target.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceNip">NIP*</Label>
                                            <Input
                                                id="invoiceNip"
                                                value={data.invoiceNip}
                                                onChange={(e) => setData('invoiceNip', e.target.value)}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. 1234567890</p>
                                        </div>
                                        {(errors.invoiceName || errors.invoiceNip) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.invoiceName} />
                                                <InputError message={errors.invoiceNip} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceRegon">REGON</Label>
                                            <Input
                                                id="invoiceRegon"
                                                value={data.invoiceRegon}
                                                onChange={(e) => setData('invoiceRegon', e.target.value)}
                                            />
                                        </div>
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceAddressStreet">Ulica i numer*</Label>
                                            <Input
                                                id="invoiceAddressStreet"
                                                value={data.invoiceAddressStreet}
                                                onChange={(e) => setData('invoiceAddressStreet', e.target.value)}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. ul. Wiejska 1/2</p>
                                        </div>
                                        {(errors.invoiceRegon || errors.invoiceAddressStreet) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.invoiceRegon} />
                                                <InputError message={errors.invoiceAddressStreet} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pb-4">
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceAddressPostalCode">Kod pocztowy*</Label>
                                            <Input
                                                id="invoiceAddressPostalCode"
                                                value={data.invoiceAddressPostalCode}
                                                onChange={(e) => setData('invoiceAddressPostalCode', e.target.value)}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. 00-000</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceAddressPlace">Miejscowość*</Label>
                                            <Input
                                                id="invoiceAddressPlace"
                                                value={data.invoiceAddressPlace}
                                                onChange={(e) => setData('invoiceAddressPlace', e.target.value)}
                                            />
                                        </div>
                                        {(errors.invoiceAddressPostalCode || errors.invoiceAddressPlace) && (
                                            <div className="col-span-2 space-y-1 pt-1">
                                                <InputError message={errors.invoiceAddressPostalCode} />
                                                <InputError message={errors.invoiceAddressPlace} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2 pb-4">
                                        <Label htmlFor="invoiceAddressCountry">Kraj*</Label>
                                        <Input
                                            id="invoiceAddressCountry"
                                            value={data.invoiceAddressCountry}
                                            onChange={(e) => setData('invoiceAddressCountry', e.target.value)}
                                        />
                                        <InputError message={errors.invoiceAddressCountry} />
                                    </div>

                                    <div className="grid gap-4 py-4">
                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="agree"
                                                checked={data.agree}
                                                onCheckedChange={(checked) => setData('agree', checked === true)}
                                                className="cursor-pointer"
                                            />
                                            <Label htmlFor="agree" className="cursor-pointer text-xs font-normal leading-normal">
                                                Wyrażam zgodę na przetwarzanie moich danych osobowych przez WORK 4 YOU GLOBAL LTD z siedzibą w Wielkiej Brytanii, dla potrzeb niezbędnych w celu realizacji umowy o świadczenie usług drogą elektroniczną i korzystanie z Serwisu www.dobrasztela.pl.*
                                            </Label>
                                        </div>
                                        <InputError message={errors.agree} />

                                        <div className="flex items-start gap-3">
                                            <Checkbox
                                                id="politicy"
                                                checked={data.politicy}
                                                onCheckedChange={(checked) => setData('politicy', checked === true)}
                                                className="cursor-pointer"
                                            />
                                            <Label htmlFor="politicy" className="cursor-pointer text-xs font-normal leading-normal">
                                                Akceptuje <TextLink href="#">Regulaminy</TextLink> i <TextLink href="#">Politykę Prywatności</TextLink>*
                                            </Label>
                                        </div>
                                        <InputError message={errors.politicy} />
                                    </div>

                                    <div className="mt-6 flex flex-col items-center gap-4">
                                        <div className="flex w-full items-center gap-4">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground/60">Krok 2/2</span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                        <div className="flex w-full gap-2">
                                            <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3 py-6">
                                                Wróć
                                            </Button>
                                            <Button type="submit" className="w-2/3 py-6 text-lg font-bold uppercase" disabled={processing}>
                                                {processing && <Spinner />}
                                                Rejestracja
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="grid gap-2 pb-4">
                                <Label htmlFor="name">Imię i nazwisko</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    autoFocus
                                    autoComplete="name"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pb-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Adres e-mail</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email_confirmation">Powtórz adres e-mail</Label>
                                    <Input
                                        id="email_confirmation"
                                        type="email"
                                        value={data.email_confirmation}
                                        onChange={(e) => setData('email_confirmation', e.target.value)}
                                    />
                                    <InputError message={errors.email_confirmation} />
                                </div>
                            </div>

                            <div className="grid gap-2 pb-4">
                                <Label htmlFor="password">Hasło</Label>
                                <PasswordInput
                                    id="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    autoComplete="new-password"
                                    passwordrules={passwordRules}
                                    onGenerate={(password) => {
                                        setData((prev) => ({
                                            ...prev,
                                            password,
                                            password_confirmation: password,
                                        }));
                                    }}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2 pb-6">
                                <Label htmlFor="password_confirmation">Potwierdź hasło</Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <Button type="submit" className="mt-2 w-full" disabled={processing}>
                                {processing && <Spinner />}
                                Utwórz konto
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-center text-sm text-muted-foreground">
                    Masz już konto?{' '}
                    <TextLink href={login()} tabIndex={6}>
                        Zaloguj się
                    </TextLink>
                </div>
            </form>

            <Dialog open={isSelectDialogOpen} onOpenChange={setIsSelectDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Opcje przesyłania</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 py-4">
                        <Button type="button" onClick={handleCropOpen} variant="outline" className="flex items-center gap-2 py-8 h-auto flex-col">
                            <Briefcase className="h-6 w-6 text-primary" />
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Przytnij logotyp</span>
                                <span className="text-xs text-muted-foreground">Dostosuj kadr obrazu</span>
                            </div>
                        </Button>
                        <Button type="button" onClick={handleNoCrop} variant="outline" className="flex items-center gap-2 py-8 h-auto flex-col">
                            <Upload className="h-6 w-6 text-primary" />
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Dodaj bez przycinania</span>
                                <span className="text-xs text-muted-foreground">Wrzuc oryginalny plik</span>
                            </div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isCropDialogOpen} onOpenChange={setIsCropDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Dostosuj logotyp</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center overflow-hidden">
                        {!!imgSrc && (
                            <ReactCrop
                                crop={crop}
                                onChange={(c) => setCrop(c)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={1}
                                circularCrop={false}
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={imgSrc}
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '60vh' }}
                                />
                            </ReactCrop>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsCropDialogOpen(false)}>
                            Anuluj
                        </Button>
                        <Button type="button" onClick={handleCropConfirm}>
                            Zatwierdź
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Register.layout = (page: React.ReactNode) => ({
    children: page,
    title: 'Utwórz konto',
    description: 'Wpisz swoje dane poniżej, aby utworzyć konto',
    className: 'sm:w-[500px]',
});
