import { useTheme } from "../../theme/tema";

// Etiqueta + campo de formulário com o estilo do tema. Use como="select" ou como="textarea" se necessário.
export default function Campo({ id, label, obrigatorio = false, como = "input", className = "", children, ...props }) {
  const tema = useTheme();
  const Elemento = como;

  return (
    <div className={className}>
      <label htmlFor={id} className={`mb-1.5 block text-xs font-semibold ${tema.label}`}>
        {label}
        {obrigatorio && " *"}
      </label>
      <Elemento
        id={id}
        required={obrigatorio}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition focus:ring-4 disabled:opacity-60 ${tema.input}`}
        {...props}
      >
        {children}
      </Elemento>
    </div>
  );
}
