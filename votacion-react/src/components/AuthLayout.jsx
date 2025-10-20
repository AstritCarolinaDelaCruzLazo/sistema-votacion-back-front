import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function AuthLayout({ title, children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-[240px] border-r" style={{background:"#F4F4F4",borderColor:"#E6E6E6"}}>
        <div className="px-6 py-6">
          <h2 className="text-2xl font-semibold mb-8" style={{color:"#1E1E1E"}}>{title}</h2>
          <nav className="space-y-6 text-sm text-[#4A4A4A]">
            <div className="cursor-pointer hover:underline" onClick={()=>navigate("/")}>Inicio</div>
            <div className="cursor-pointer hover:underline" onClick={()=>navigate(-1)}>Volver</div>
          </nav>
          <div className="mt-16 text-sm text-[#4A4A4A] cursor-pointer hover:underline" onClick={()=>navigate("/reportes")}>Ir a reportes</div>
          <div className="mt-3 text-sm text-[#4A4A4A] cursor-pointer hover:underline"
               onClick={()=>{ logout(); localStorage.clear(); navigate("/"); }}>
            Salir
          </div>
        </div>
      </aside>
      <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
    </div>
  );
}
