import { Head, useForm, router } from '@inertiajs/react';
import { Briefcase, Car, Upload, User, X } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Select from 'react-select';

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
import { reactSelectStyles, HideGroupHeading, HideGroupMenuList } from '@/lib/select-styles';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { store, validateStep1 } from '@/routes/register';

type Consent = {
    id: number;
    content: string;
    required: boolean;
    type: string;
};

type Props = {
    passwordRules: string;
    consents: Record<string, Consent[]>;
    langs: { id: number; name: string }[];
    langLevels: { id: number; name: string; value: number }[];
    countries: { id: number; name: string }[];
    lands: { id: number; name: string; short: string; country_id: number }[];
};

export default function Register({ passwordRules, consents, langs, langLevels, lands }: Props) {
    const [step, setStep] = useState(1);
    const [isMounted, setIsMounted] = useState(false);
    const [isValidating, setIsValidating] = useState(false);

    // Stan dla przycinania obrazu
    const [imgSrc, setImgSrc] = useState('');
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
    const [scale, setScale] = useState(1);
    const [isCropDialogOpen, setIsCropDialogOpen] = useState(false);
    const [isSelectDialogOpen, setIsSelectDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [langMenuOpen, setLangMenuOpen] = useState(false);


    const languagesList = langs
        .filter(l => {
            const name = (l.name || (l as any).lang || '').toLowerCase();

            return name !== 'niemiecki' && name !== 'niemiecki (wszystkie poziomy)';
        })
        .map(l => ({ label: l.name || (l as any).lang, value: l.id, type: 'other' }));

    const regionsList = lands
        .filter(l => l.country_id === 11) // Polska ID 11
        .map(l => ({
            label: l.name,
            value: l.id
        }));

    const langOptions = useMemo(() => {
        const germanLevels = langLevels
            .map(level => ({
                label: (level as any).name || (level as any).level || (level as any).lang,
                value: level.id,
                type: 'de'
            }));

        const options = [];

        if (germanLevels.length > 0) {
            options.push({
                label: 'Niemiecki',
                options: germanLevels
            });
        }

        if (languagesList.length > 0) {
            options.push({
                label: 'Inny',
                options: languagesList
            });
        }

        return options;
    }, [langLevels, languagesList]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsMounted(true);
        }, 0);

        return () => clearTimeout(timer);
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
        region: '',
        regionText: '',
        de: { type: 'de', value: '' } as { type: string; value: string | number },
        other: [] as { label: string; value: number }[],
        otherCountry: false,
        consents: {} as Record<number, boolean>,
    });

    const isFirstRun = useRef(true);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;

            return;
        }

        // Reset wszystkich pól przy zmianie roli
        setData({
            ...data,
            name: '',
            email: '',
            email_confirmation: '',
            password: '',
            password_confirmation: '',
            firstName: '',
            lastName: '',
            phone: '',
            companyEmailApplication: '',
            companyWebsite: '',
            fileuploadCard: null,
            invoiceName: '',
            invoiceNip: '',
            invoiceRegon: '',
            invoiceAddressStreet: '',
            invoiceAddressPostalCode: '',
            invoiceAddressPlace: '',
            invoiceAddressCountry: 'Polska',
            region: '',
            regionText: '',
            de: { type: 'de', value: 1 },
            other: [],
            otherCountry: false,
            consents: {},
        });

        clearErrors();
        setStep(1);
        setPreviewUrl('');
    }, [data.role_id]);

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
        setScale(1);
        setIsSelectDialogOpen(false);
        setIsCropDialogOpen(true);
    };

    const handleToggleAllConsents = () => {
        if (!currentConsents) {
            return;
        }

        const allConsents = { ...data.consents };
        const areAllSelected = currentConsents.every((consent) => data.consents[consent.id] === true);

        currentConsents.forEach((consent) => {
            allConsents[consent.id] = !areAllSelected;
        });

        setData('consents', allConsents);
    };

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { width, height } = e.currentTarget;
        const initialCrop = centerCrop(
            makeAspectCrop(
                {
                    unit: 'px',
                    width: 200,
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
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const naturalWidth = imgRef.current.naturalWidth;
        const naturalHeight = imgRef.current.naturalHeight;
        const displayedWidth = imgRef.current.width;
        const displayedHeight = imgRef.current.height;

        const scaleX = naturalWidth / displayedWidth;
        const scaleY = naturalHeight / displayedHeight;

        // Rozmiar wyjściowy canvasa
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;

        ctx.save();

        // 1. Obliczamy współrzędne środka obrazu w układzie layoutowym
        const centerX = displayedWidth / 2;
        const centerY = displayedHeight / 2;

        // 2. Przekształcamy współrzędne cropa (x, y) z układu widocznego (po transform: scale)
        // do układu layoutowego obrazka (bez scale).
        // Wzór na transformację z punktu layout P do widocznego V przy transform-origin: center:
        // V = Center + (P - Center) * Scale
        // Zatem: P = Center + (V - Center) / Scale

        const getLayoutPos = (v: number, center: number) => center + (v - center) / scale;

        const layoutX1 = getLayoutPos(completedCrop.x, centerX);
        const layoutY1 = getLayoutPos(completedCrop.y, centerY);
        const layoutX2 = getLayoutPos(completedCrop.x + completedCrop.width, centerX);
        const layoutY2 = getLayoutPos(completedCrop.y + completedCrop.height, centerY);

        const sourceX = layoutX1 * scaleX;
        const sourceY = layoutY1 * scaleY;
        const sourceWidth = (layoutX2 - layoutX1) * scaleX;
        const sourceHeight = (layoutY2 - layoutY1) * scaleY;

        ctx.drawImage(
            imgRef.current,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.restore();

        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], 'logo.png', { type: 'image/png' });
                setData('fileuploadCard', file);
                setPreviewUrl(URL.createObjectURL(blob));
            }
        }, 'image/png');

        setIsCropDialogOpen(false);
    };

    const getConsentsForRole = () => {
        if (data.role_id === '2') {
            return consents['Rejestracja pracodawcy'] || [];
        }

        if (data.role_id === '3') {
            return consents['Rejestracja opiekunki'] || [];
        }

        if (data.role_id === '5') {
            return consents['Aplikacja do wielu'] || [];
        }

        return [];
    };

    const currentConsents = getConsentsForRole();

    if (!isMounted) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Spinner className="h-8 w-8 text-primary" />
            </div>
        );
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstName">Imię*</Label>
                                            <Input
                                                id="firstName"
                                                value={data.firstName}
                                                onChange={(e) => {
                                                    setData('firstName', e.target.value);
                                                    setData('name', `${e.target.value} ${data.lastName}`.trim());
                                                }}
                                                aria-invalid={!!errors.firstName}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastName">Nazwisko*</Label>
                                            <Input
                                                id="lastName"
                                                value={data.lastName}
                                                onChange={(e) => {
                                                    setData('lastName', e.target.value);
                                                    setData('name', `${data.firstName} ${e.target.value}`.trim());
                                                }}
                                                aria-invalid={!!errors.lastName}
                                            />
                                        </div>
                                        {(errors.firstName || errors.lastName) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.firstName} />
                                                <InputError message={errors.lastName} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="email">Email<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                aria-invalid={!!errors.email}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="email_confirmation">Powtórz email<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="email_confirmation"
                                                type="email"
                                                value={data.email_confirmation}
                                                onChange={(e) => setData('email_confirmation', e.target.value)}
                                                aria-invalid={!!errors.email_confirmation}
                                            />
                                        </div>
                                        {(errors.email || errors.email_confirmation) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.email} />
                                                <InputError message={errors.email_confirmation} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="companyEmailApplication">E-mail do aplikacji<span className="text-brand-burgundy">*</span></Label>
                                        <Input
                                            id="companyEmailApplication"
                                            type="email"
                                            value={data.companyEmailApplication}
                                            onChange={(e) => setData('companyEmailApplication', e.target.value)}
                                            aria-invalid={!!errors.companyEmailApplication}
                                        />
                                        <InputError message={errors.companyEmailApplication} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
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
                                                aria-invalid={!!errors.password}
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
                                                aria-invalid={!!errors.password_confirmation}
                                            />
                                        </div>
                                        {(errors.password || errors.password_confirmation) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.password} />
                                                <InputError message={errors.password_confirmation} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="phone">Numer telefonu<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                aria-invalid={!!errors.phone}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="companyWebsite">Strona www<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="companyWebsite"
                                                value={data.companyWebsite}
                                                onChange={(e) => setData('companyWebsite', e.target.value)}
                                                placeholder="mojastrona.pl"
                                                addon="https://"
                                                aria-invalid={!!errors.companyWebsite}
                                            />
                                        </div>
                                        {(errors.phone || errors.companyWebsite) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.phone} />
                                                <InputError message={errors.companyWebsite} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="fileuploadCard">Logo<span className="text-brand-burgundy">*</span></Label>
                                        <div className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/20 bg-brand-light-pink/50 p-6 transition-all hover:border-primary/30 hover:bg-brand-light-pink">
                                            <Input
                                                id="fileuploadCard"
                                                type="file"
                                                onChange={onSelectFile}
                                                accept="image/*"
                                                className="hidden"
                                                aria-invalid={!!errors.fileuploadCard}
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceName">Nazwa firmy<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="invoiceName"
                                                value={data.invoiceName}
                                                onChange={(e) => {
                                                    setData('invoiceName', e.target.value);

                                                    if (!data.name) {
                                                        setData('name', e.target.value);
                                                    }
                                                }}
                                                aria-invalid={!!errors.invoiceName}
                                            />
                                        </div>
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceNip">NIP<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="invoiceNip"
                                                value={data.invoiceNip}
                                                onChange={(e) => setData('invoiceNip', e.target.value)}
                                                aria-invalid={!!errors.invoiceNip}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. 1234567890</p>
                                        </div>
                                        {(errors.invoiceName || errors.invoiceNip) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.invoiceName} />
                                                <InputError message={errors.invoiceNip} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceRegon">REGON</Label>
                                            <Input
                                                id="invoiceRegon"
                                                value={data.invoiceRegon}
                                                onChange={(e) => setData('invoiceRegon', e.target.value)}
                                                aria-invalid={!!errors.invoiceRegon}
                                            />
                                        </div>
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceAddressStreet">Ulica i numer<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="invoiceAddressStreet"
                                                value={data.invoiceAddressStreet}
                                                onChange={(e) => setData('invoiceAddressStreet', e.target.value)}
                                                aria-invalid={!!errors.invoiceAddressStreet}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. ul. Wiejska 1/2</p>
                                        </div>
                                        {(errors.invoiceRegon || errors.invoiceAddressStreet) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.invoiceRegon} />
                                                <InputError message={errors.invoiceAddressStreet} className="mt-4" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative grid gap-2">
                                            <Label htmlFor="invoiceAddressPostalCode">Kod pocztowy<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="invoiceAddressPostalCode"
                                                value={data.invoiceAddressPostalCode}
                                                onChange={(e) => setData('invoiceAddressPostalCode', e.target.value)}
                                                aria-invalid={!!errors.invoiceAddressPostalCode}
                                            />
                                            <p className="absolute top-full left-0 pt-0.5 text-[11px] text-muted-foreground">np. 00-000</p>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="invoiceAddressPlace">Miejscowość<span className="text-brand-burgundy">*</span></Label>
                                            <Input
                                                id="invoiceAddressPlace"
                                                value={data.invoiceAddressPlace}
                                                onChange={(e) => setData('invoiceAddressPlace', e.target.value)}
                                                aria-invalid={!!errors.invoiceAddressPlace}
                                            />
                                        </div>
                                        {(errors.invoiceAddressPostalCode || errors.invoiceAddressPlace) && (
                                            <div className="col-span-2 space-y-1">
                                                <InputError message={errors.invoiceAddressPostalCode} className="mt-4" />
                                                <InputError message={errors.invoiceAddressPlace} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="invoiceAddressCountry">Kraj<span className="text-brand-burgundy">*</span></Label>
                                        <Input
                                            id="invoiceAddressCountry"
                                            value={data.invoiceAddressCountry}
                                            onChange={(e) => setData('invoiceAddressCountry', e.target.value)}
                                            aria-invalid={!!errors.invoiceAddressCountry}
                                        />
                                        <InputError message={errors.invoiceAddressCountry} />
                                    </div>

                                    <div className="grid gap-4 py-4">
                                        {currentConsents && currentConsents.length > 0 && (
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    size="sm"
                                                    onClick={handleToggleAllConsents}
                                                    className="h-auto p-0 text-xs text-primary"
                                                >
                                                    {currentConsents.every((consent) => data.consents[consent.id] === true)
                                                        ? 'Odznacz wszystkie zgody'
                                                        : 'Zaznacz wszystkie zgody'}
                                                </Button>
                                            </div>
                                        )}
                                        {currentConsents && currentConsents.length > 0 ? (
                                            currentConsents.map((consent) => (
                                                <div key={consent.id} className="flex flex-col gap-1">
                                                    <div className="flex items-start gap-3">
                                                <Checkbox
                                                            id={`consent-${consent.id}`}
                                                            checked={data.consents[consent.id] || false}
                                                            onCheckedChange={(checked) => {
                                                                setData('consents', {
                                                                    ...data.consents,
                                                                    [consent.id]: checked === true,
                                                                });
                                                            }}
                                                            className="cursor-pointer"
                                                            aria-invalid={!!(errors as any)[`consents.${consent.id}`]}
                                                        />
                                                        <Label
                                                            htmlFor={`consent-${consent.id}`}
                                                            className={cn(
                                                                "cursor-pointer text-xs font-normal leading-normal",
                                                                !!(errors as any)[`consents.${consent.id}`] && !data.consents[consent.id]
                                                                    ? "text-brand-burgundy"
                                                                    : "text-foreground"
                                                            )}
                                                        >
                                                            <span dangerouslySetInnerHTML={{ __html: consent.content }} />
                                                            {consent.required && <span className="text-brand-burgundy ml-0.5 font-bold">*</span>}
                                                        </Label>
                                                    </div>
                                                    <InputError message={(errors as any)[`consents.${consent.id}`]} />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-muted-foreground italic">Brak wymaganych zgód dla tej roli.</div>
                                        )}
                                        {errors.consents && (
                                            <div className="text-center">
                                                <InputError message={errors.consents} />
                                            </div>
                                        )}
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">Imię<span className="text-brand-burgundy">*</span></Label>
                                    <Input
                                        id="firstName"
                                        value={data.firstName}
                                        onChange={(e) => {
                                            setData('firstName', e.target.value);
                                            setData('name', `${e.target.value} ${data.lastName}`.trim());
                                        }}
                                        autoFocus
                                        aria-invalid={!!errors.firstName}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Nazwisko<span className="text-brand-burgundy">*</span></Label>
                                    <Input
                                        id="lastName"
                                        value={data.lastName}
                                        onChange={(e) => {
                                            setData('lastName', e.target.value);
                                            setData('name', `${data.firstName} ${e.target.value}`.trim());
                                        }}
                                        aria-invalid={!!errors.lastName}
                                    />
                                </div>
                                {(errors.firstName || errors.lastName) && (
                                    <div className="col-span-2 space-y-1">
                                        <InputError message={errors.firstName} />
                                        <InputError message={errors.lastName} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">Adres e-mail<span className="text-brand-burgundy">*</span></Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        autoComplete="email"
                                        aria-invalid={!!errors.email}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email_confirmation">Powtórz adres e-mail<span className="text-brand-burgundy">*</span></Label>
                                    <Input
                                        id="email_confirmation"
                                        type="email"
                                        value={data.email_confirmation}
                                        onChange={(e) => setData('email_confirmation', e.target.value)}
                                        aria-invalid={!!errors.email_confirmation}
                                    />
                                </div>
                                {(errors.email || errors.email_confirmation) && (
                                    <div className="col-span-2 space-y-1">
                                        <InputError message={errors.email} />
                                        <InputError message={errors.email_confirmation} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">Hasło<span className="text-brand-burgundy">*</span></Label>
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
                                        aria-invalid={!!errors.password}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">Powtórz hasło<span className="text-brand-burgundy">*</span></Label>
                                    <PasswordInput
                                        id="password_confirmation"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        autoComplete="new-password"
                                        aria-invalid={!!errors.password_confirmation}
                                    />
                                </div>
                                {(errors.password || errors.password_confirmation) && (
                                    <div className="col-span-2 space-y-1">
                                        <InputError message={errors.password} />
                                        <InputError message={errors.password_confirmation} />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Numer telefonu<span className="text-brand-burgundy">*</span></Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        aria-invalid={!!errors.phone}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="de">Znajomość języka<span className="text-brand-burgundy">*</span></Label>
                                    <Select
                                        id="de"
                                        placeholder="Znajomość języka"
                                        options={langOptions}
                                        menuIsOpen={langMenuOpen}
                                        onMenuOpen={() => setLangMenuOpen(true)}
                                        onMenuClose={() => setLangMenuOpen(false)}
                                        aria-invalid={!!(errors as any).de}
                                        value={
                                            data.de.type === 'de' && data.de.value
                                                ? {
                                                    label: (langLevels.find(l => l.id === (data.de.value as number)) as any)?.name || (langLevels.find(l => l.id === (data.de.value as number)) as any)?.level || (langLevels.find(l => l.id === (data.de.value as number)) as any)?.lang,
                                                    value: data.de.value,
                                                    type: 'de'
                                                }
                                                : data.other.length > 0
                                                    ? {
                                                        label: data.other[0].label,
                                                        value: data.other[0].value,
                                                        type: 'other'
                                                    }
                                                    : null
                                        }
                                        onChange={(option: any) => {
                                            if (option) {
                                                if (option.type === 'de') {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        de: { type: 'de', value: option.value },
                                                        other: [],
                                                    }));
                                                } else {
                                                    setData((prev) => ({
                                                        ...prev,
                                                        de: { type: 'other', value: '' },
                                                        other: [{ label: option.label, value: option.value }],
                                                    }));
                                                }
                                            }
                                        }}
                                        styles={reactSelectStyles}
                                        isSearchable
                                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                        noOptionsMessage={() => "Nie znaleziono języka"}
                                        components={{
                                            GroupHeading: HideGroupHeading,
                                            MenuList: HideGroupMenuList,
                                        }}
                                    />
                                </div>
                                {(errors.phone || (errors as any).de) && (
                                    <div className="col-span-2 space-y-1">
                                        <InputError message={errors.phone} />
                                        <InputError message={errors.de as unknown as string} />
                                    </div>
                                )}
                            </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="region">Miejsce zamieszkania (PL)<span className="text-brand-burgundy">*</span></Label>
                                    <div className="grid grid-cols-2 gap-4 items-start">
                                        <div className="grid gap-2">
                                            {!data.otherCountry ? (
                                                <Select
                                                    id="region"
                                                    placeholder="Wybierz województwo"
                                                    options={regionsList}
                                                    value={regionsList.find(r => r.value === parseInt(data.region))}
                                                    onChange={(option: any) => setData('region', option?.value.toString() || '')}
                                                    styles={reactSelectStyles}
                                                    isSearchable
                                                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                                                    noOptionsMessage={() => "Nie znaleziono województwa"}
                                                    aria-invalid={!!errors.region}
                                                />
                                            ) : (
                                                <Input
                                                    id="regionText"
                                                    value={data.regionText}
                                                    onChange={(e) => setData('regionText', e.target.value)}
                                                    placeholder="Wpisz kraj/miejscowość"
                                                    autoFocus
                                                    aria-invalid={!!errors.regionText}
                                                />
                                            )}
                                            <InputError message={data.otherCountry ? errors.regionText : errors.region} />
                                        </div>
                                        <div className="flex items-center gap-2 pt-3">
                                            <Checkbox
                                                id="otherCountry"
                                                checked={data.otherCountry}
                                                onCheckedChange={(checked) => {
                                                    const isOther = checked === true;
                                                    setData((prev) => ({
                                                        ...prev,
                                                        otherCountry: isOther,
                                                        region: '',
                                                        regionText: '',
                                                    }));
                                                }}
                                                aria-invalid={!!errors.otherCountry}
                                            />
                                            <Label htmlFor="otherCountry" className="cursor-pointer">
                                                inny kraj
                                            </Label>
                                        </div>
                                    </div>
                                </div>

                            <div className="grid gap-4 py-4">
                                {currentConsents && currentConsents.length > 0 && (
                                    <div className="flex justify-end">
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            onClick={handleToggleAllConsents}
                                            className="h-auto p-0 text-xs text-primary"
                                        >
                                            {currentConsents.every((consent) => data.consents[consent.id] === true)
                                                ? 'Odznacz wszystkie zgody'
                                                : 'Zaznacz wszystkie zgody'}
                                        </Button>
                                    </div>
                                )}
                                {currentConsents && currentConsents.length > 0 ? (
                                    currentConsents.map((consent) => (
                                        <div key={consent.id} className="flex flex-col gap-1">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id={`consent-${consent.id}`}
                                                    checked={data.consents[consent.id] || false}
                                                    onCheckedChange={(checked) => {
                                                        setData('consents', {
                                                            ...data.consents,
                                                            [consent.id]: checked === true,
                                                        });
                                                    }}
                                                    className="cursor-pointer"
                                                    aria-invalid={!!(errors as any)[`consents.${consent.id}`]}
                                                />
                                                <Label
                                                    htmlFor={`consent-${consent.id}`}
                                                    className={cn(
                                                        "cursor-pointer text-xs font-normal leading-normal",
                                                        !!(errors as any)[`consents.${consent.id}`] && !data.consents[consent.id]
                                                            ? "text-brand-burgundy"
                                                            : "text-foreground"
                                                    )}
                                                >
                                                    <span dangerouslySetInnerHTML={{ __html: consent.content }} />
                                                    {consent.required && <span className="text-brand-burgundy ml-0.5 font-bold">*</span>}
                                                </Label>
                                            </div>
                                            <InputError message={(errors as any)[`consents.${consent.id}`]} />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-xs text-muted-foreground italic">Brak wymaganych zgód dla tej roli.</div>
                                )}
                                {errors.consents && (
                                    <div className="text-center">
                                        <InputError message={errors.consents} />
                                    </div>
                                )}
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
                        <DialogTitle className="text-center">Wybierz sposób dodania logo</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3 py-4">
                        <button
                            type="button"
                            onClick={handleCropOpen}
                            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-brand-light-pink hover:shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                                <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-sm font-semibold">Przytnij</span>
                                <span className="text-[10px] text-muted-foreground">Dostosuj kadr</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={handleNoCrop}
                            className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-border bg-card p-4 transition-all hover:bg-brand-light-pink hover:shadow-sm"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 transition-colors group-hover:bg-primary/10">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <span className="text-sm font-semibold">Oryginał</span>
                                <span className="text-[10px] text-muted-foreground">Bez zmian</span>
                            </div>
                        </button>
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
                            <>
                                <div className="mb-4 flex w-full flex-col gap-2 px-4">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <span>Zoom</span>
                                        <span>{Math.round(scale * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={scale}
                                        onChange={(e) => setScale(Number(e.target.value))}
                                        className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary"
                                    />
                                </div>
                                <ReactCrop
                                    crop={crop}
                                    onChange={(c) => setCrop(c)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop={false}
                                    locked
                                >
                                    <img
                                        ref={imgRef}
                                        alt="Crop me"
                                        src={imgSrc}
                                        onLoad={onImageLoad}
                                        style={{
                                            maxHeight: '60vh',
                                            transform: `scale(${scale})`,
                                            transformOrigin: 'center',
                                        }}
                                    />
                                </ReactCrop>
                            </>
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
