/**
 * @file Components/Inputs/Input.tsx
 *
 * Komponen input teks yang dapat digunakan kembali (reusable) dengan dukungan
 * label, pesan error, dan teks pembantu (helper text).
 *
 * Didesain untuk bekerja lancar baik dengan Inertia Form maupun state React biasa.
 */

import { cn } from "@/Lib/utils";
import { type InputFieldProps } from "@/Types/inputs";

/**
 * Komponen input form dengan label, validasi, dan helper text terintegrasi.
 *
 * Merender struktur lengkap: label di atas, input di tengah, dan
 * pesan error/helper text di bawah. Mendukung semua atribut `<input>` HTML
 * standar melalui spread props.
 *
 * @param props.label          - Teks label yang ditampilkan di atas input
 * @param props.name           - Atribut name HTML (wajib untuk form submission)
 * @param props.type           - Tipe input HTML (text, email, password, dsb.)
 * @param props.errorMessage   - Pesan error validasi; jika ada, label berubah merah
 * @param props.helperText     - Teks bantuan di bawah input; tersembunyi saat ada error
 * @param props.wrapperClassName - Class tambahan untuk div pembungkus luar
 * @param props.className      - Class tambahan untuk elemen `<input>` dan label
 *
 * @example
 * <Input
 *   type="email"
 *   name="email"
 *   label="Alamat Email"
 *   placeholder="nama@contoh.com"
 *   errorMessage={errors.email}
 * />
 */
const Input = (props: InputFieldProps) => {
    const { className, type, label, errorMessage, id, helperText, wrapperClassName, ...rest } = props;
    return (
        <div className={cn("flex w-full flex-col gap-1", wrapperClassName)}>
            <div className="flex flex-row gap-2">
                <label className={cn("text-neutral-800 dark:text-neutral-400", errorMessage && "text-red-500", className)} htmlFor={id}>
                    {label}
                </label>
            </div>
            <div className="flex flex-row items-center justify-start gap-2">
                <div className="relative w-full">
                    <input
                        ref={rest.ref}
                        type={type}
                        className={cn(
                            "flex w-full rounded-lg",
                            "px-3 py-2",
                            "border border-neutral-600 dark:border-teal-900",
                            "bg-neutral-300/20 dark:bg-neutral-700/20",
                            "text-neutral-800 dark:text-neutral-100",
                            "file:text-neutral-300 placeholder:text-neutral-500",
                            "shadow-sm transition-colors",
                            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
                            "focus-visible:ring-1 focus-visible:outline-none",
                            "disabled:cursor-not-allowed disabled:opacity-70",
                            "text-base md:text-sm",
                            className,
                        )}
                        id={id}
                        {...rest}
                    />
                </div>
            </div>
            {/* Helper text: tersembunyi jika ada pesan error */}
            <p className={cn("text-sm", "text-neutral-800 dark:text-neutral-400", errorMessage && "hidden")}>{helperText}</p>
            {/* Pesan error validasi */}
            <p id={`error-${id}`} className={cn("text-red-500", className)}>
                {errorMessage}
            </p>
        </div>
    );
};
Input.displayName = "Input";

export default Input;
