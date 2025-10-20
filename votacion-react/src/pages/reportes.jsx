import React, { useMemo } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale
} from "chart.js";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, TimeScale
);

export default function Reportes() {
  const padronTotal = 1000;
  const votos = useMemo(() => JSON.parse(localStorage.getItem("votos") || "[]"), []);

  const participacion = votos.length;
  const noParticipacion = Math.max(padronTotal - participacion, 0);

  const conteoPorPartido = votos.reduce((acc, v) => {
    acc[v.partido] = (acc[v.partido] || 0) + 1;
    return acc;
  }, {});
  const partidos = Object.keys(conteoPorPartido);
  const votosPartido = Object.values(conteoPorPartido);

  const buckets = {};
  votos.forEach(v => {
    const d = new Date(v.ts);
    const label = `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}`;
    buckets[label] = (buckets[label] || 0) + 1;
  });
  const labelsTiempo = Object.keys(buckets).sort();
  const datosTiempo = labelsTiempo.map(l => buckets[l]);

  // opciones comunes
  const optNoAspect = { responsive: true, maintainAspectRatio: false };
  const optLegendBottom = { ...optNoAspect, plugins:{ legend:{ position:"bottom" } } };

  return (
    <div className="container my-4">
      <div className="-flex justify-content-center align-items-center mb-3 gap-3">
        <h2 className="fw-bold text-center fs-3 mb-0"style={{ color: "#1f2329" }}>Reportes y análisis</h2>
        <div>
          <div className="text-center"></div>
          <a href="/votacion" className="btn btn-outline-secondary btn-sm">Volver a Votación</a>
        </div>
       
      </div>

      {/* KPIs */}
      <div className="row g-3 mb-3">
        {[
          {t:"Padron", v: padronTotal},
          {t:"Votos emitidos", v: participacion},
          {t:"% Participación", v: padronTotal ? ((participacion/padronTotal)*100).toFixed(1)+"%" : "0%"},
          {t:"Abstenciones", v: noParticipacion},
        ].map((m,i)=>(
          <div key={i} className="col-6 col-md-3">
            <div className="card text-center p-3 h-100">
              <div className="fw-bold">{m.t}</div>
              <div className="display-6">{m.v}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="row g-3">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm chart-card h-100">
            <div className="card-header bg-white fw-semibold">Participación</div>
            <div className="card-body">
              <div className="chart-wrap">
                <Pie
                  data={{
                    labels: ["Votaron", "No votaron"],
                    datasets: [{ data: [participacion, noParticipacion], backgroundColor:["#5b8def","#e5e7eb"] }]
                  }}
                  options={optLegendBottom}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm chart-card h-100">
            <div className="card-header bg-white fw-semibold">Votos por partido</div>
            <div className="card-body">
              <div className="chart-wrap">
                <Bar
                  data={{
                    labels: partidos,
                    datasets: [{ label: "Votos", data: votosPartido, backgroundColor:"#9aa6ff" }]
                  }}
                  options={{
                    ...optLegendBottom,
                    indexAxis: "y",
                    scales: {
                      x: { beginAtZero: true, ticks: { precision:0 } },
                      y: { ticks: { autoSkip: true, maxTicksLimit: 8 } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card shadow-sm chart-card h-100">
            <div className="card-header bg-white fw-semibold">Evolución temporal</div>
            <div className="card-body">
              <div className="chart-wrap">
                <Line
                  data={{
                    labels: labelsTiempo,
                    datasets: [{ label: "Votos/min", data: datosTiempo, borderColor:"#5b8def", tension:0.3, pointRadius:2 }]
                  }}
                  options={{
                    ...optLegendBottom,
                    scales:{
                      x:{ ticks:{ autoSkip:true, maxTicksLimit:6 } },
                      y:{ beginAtZero:true, ticks:{ precision:0 } }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="alert alert-info mt-4">
        Nota: estos reportes leen datos locales. Para cuando se este e la nube, se debe conecta a API/BD o usar conezion en BI.
      </div>
    </div>
  );
}
