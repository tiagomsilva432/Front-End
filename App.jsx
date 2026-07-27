import { useState } from "react";

function PagLogin() {
  const [cargo, setCargo] = useState("funcionario");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const Login = (e) => {
    e.pretendDefault();
  };
  return (
    <div className=" min-h-screen flex items-center justify-center font-sans bg-black overflow-hidden">
      <div /* cartao central*/ className="bg-gray-300 rounded-3xl shadow-2xl">
        <div className="text-center">
          <h1 className=" m-6 font-bold text-2xl m-4">
            bem vindo ao grupo Os Silvas
          </h1>
          <p>Acesse sua conta</p>
        </div>
        <form onSubmit={Login}>
          <div className="mt-10 p-0 block text-center">
            <label className="">tipo colaborador</label>
            <div>
              <button
                type="button"
                onClick={() => setCargo("adm")}
                className={`flex-1 py-2 border rounded font-bold text-blue-500  ${cargo === "adm" ? "boder-blue-400" : "border-gray-300 text-gray-600"} hover:text-blue-600 transition-colors`}
              >
                Administrativo
              </button>

              <button
                type="button"
                onClick={() => setCargo("emp")}
                className={`flex-1 py-2 m-5 border rounded font-bold text-blue-500 ${cargo === "emp" ? "boder-blue-400" : "border-gray-300 text-gray-600"} hover:text-blue-600 transition-colors`}
              >
                Empregado
              </button>

              <button
                type="button"
                onClick={() => setCargo("gest")}
                className={`flex-1 py-2 border rounded font-bold text-blue-500  ${cargo === "gest" ? "boder-blue-400" : "border-gray-300 text-gray-600"} hover:text-blue-600 transition-colors`}
              >
                Gestor
              </button>
            </div>
          </div>

          <div className="m-4">
            <label htmlFor="">
              <input
                type="text"
                placeholder="exemplo@email.com"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full border border-gray-400 rounded focus:outline-none focus:border-black"
              />
            </label>
          </div>

          <div className="m-4">
            <label htmlFor="">
              <input
                type="password"
                placeholder="*********"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full border border-gray-400 rounded focus:outline-none focus:border-black"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-300 text-white font-bold py-2 rounded-3xl hover:bg-blue-700 transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default PagLogin;
