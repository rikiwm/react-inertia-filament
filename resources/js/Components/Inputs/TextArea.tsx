/**
 * @file Components/Inputs/TextArea.tsx
 *
 * Komponen area teks (textarea) yang dapat digunakan kembali dengan dukungan
 * label, pesan error, dan teks pembantu — sejajar dengan komponen Input.
 */

import { cn } from "@/Lib/Utils";
import { type TextAreaProps } from "@/Types/Inputs";

/**
 * Komponen textarea form dengan label, validasi, dan helper text terintegrasi.
 *
 * Merender struktur: label di atas, textarea di tengah, dan
 * pesan error/helper text di bawah. Mendukung semua atribut `<textarea>` HTML
 * standar melalui spread props, termasuk `rows`, `cols`, dan `maxLength`.
 *
 * @param props.label          - Teks label yang ditampilkan di atas textarea
 * @param props.name           - Atribut name HTML (wajib untuk form submission)
 * @param props.errorMessage   - Pesan error validasi; jika ada, label berubah merah
 * @param props.helperText     - Teks bantuan di bawah textarea; tersembunyi saat ada error
 * @param props.wrapperClassName - Class tambahan untuk div pembungkus luar
 * @param props.className      - Class tambahan untuk elemen `<textarea>` dan label
 *
 * @example
 * <TextArea
 *   name="message"
 *   label="Pesan Anda"
 *   placeholder="Tulis pesan di sini..."
 *   rows={4}
 *   errorMessage={errors.message}
 * />
 */
const TextArea = (props: TextAreaProps) => {
    const { className, label, errorMessage, id, helperText, wrapperClassName, ...rest } = props;
    return (
        <div className={cn("flex flex-col gap-1", "w-full", wrapperClassName)}>
            <div className="flex flex-row gap-2">
                <label className={cn("text-neutral-800 dark:text-neutral-400", errorMessage && "text-red-500", className)} htmlFor={id}>
                    {label}
                </label>
            </div>
            <div className="flex flex-row items-center justify-start gap-2">
                <div className="relative w-full">
                    <textarea
                        ref={rest.ref}
                        className={cn(
                            "flex w-full",
                            "px-3 py-2",
                            "rounded-lg",
                            "border border-neutral-600",
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
                    ></textarea>
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
TextArea.displayName = "TextArea";

export default TextArea;
