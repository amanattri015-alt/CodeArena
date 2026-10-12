import { useFieldArray } from "react-hook-form";
import { languageOptions } from "../config/problemForm.config";

function DynamicFieldArray({
    control,
    register,
    name,
    title,
    subtitle,
    fields,
    defaultItem,
}) {
    const { fields: items, append, remove } = useFieldArray({
        control,
        name,
    });

    return (
        <section className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
            {/* Header */}
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                    <h3 className="text-lg font-black">{title}</h3>

                    <p className="text-sm text-base-content/50">
                        {subtitle}
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => append({ ...defaultItem })}
                >
                    + Add
                </button>
            </div>

            {/* Items */}
            <div className="mt-5 space-y-4">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="rounded-xl border border-base-300 bg-base-200/40 p-4"
                    >
                        {/* Item header */}
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-bold">
                                #{index + 1}
                            </span>

                            {items.length > 1 && (
                                <button
                                    type="button"
                                    className="btn btn-ghost btn-xs text-error"
                                    onClick={() => remove(index)}
                                >
                                    Remove
                                </button>
                            )}
                        </div>

                        {/* Fields */}
                        <div
                            className={`grid gap-4 ${
                                fields.length > 2
                                    ? "md:grid-cols-3"
                                    : "md:grid-cols-2"
                            }`}
                        >
                            {fields.map((field) => {
                                const fieldName =
                                    `${name}.${index}.${field.name}`;

                                return (
                                    <div
                                        key={field.name}
                                        className={
                                            field.fullWidth
                                                ? "md:col-span-full"
                                                : ""
                                        }
                                    >
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-base-content/50">
                                            {field.label}
                                        </label>

                                        {field.type === "select" ? (
                                            <select
                                                className="select select-bordered w-full"
                                                {...register(fieldName)}
                                            >
                                                {languageOptions.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={
                                                                option.value
                                                            }
                                                        >
                                                            {option.label}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        ) : (
                                            <textarea
                                                className={`textarea textarea-bordered w-full font-mono text-sm ${
                                                    field.code
                                                        ? "min-h-40"
                                                        : "min-h-24"
                                                }`}
                                                {...register(fieldName)}
                                                placeholder={field.label}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default DynamicFieldArray;