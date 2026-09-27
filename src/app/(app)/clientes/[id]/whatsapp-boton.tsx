"use client";

import { useState, useTransition } from "react";
import { enlaceWhatsapp, type PlantillaWhatsapp } from "@/lib/whatsapp";
import { registrarWhatsapp } from "../actions";

export function WhatsappBoton({
  clienteId,
  numero,
  plantillas,
}: {
  clienteId: string;
  numero: string | null;
  plantillas: PlantillaWhatsapp[];
}) {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState(plantillas[0]?.texto ?? "");
  const [registrado, setRegistrado] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!numero) {
    return (
      <span className="inline-block rounded-lg bg-stone-200/60 px-3 py-1.5 text-sm text-stone-500" title="Agrega un celular en la ficha del cliente">
        Sin celular para WhatsApp
      </span>
    );
  }

  function enviar() {
    // Se abre la pestaña antes de esperar al servidor para que el navegador no la bloquee.
    window.open(enlaceWhatsapp(numero!, mensaje), "_blank", "noopener,noreferrer");
    startTransition(async () => {
      await registrarWhatsapp(clienteId, mensaje);
      setRegistrado(true);
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setAbierto(!abierto);
          setRegistrado(false);
        }}
        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700"
      >
        Escribir por WhatsApp
      </button>
      {abierto && (
        <div className="card mt-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            {plantillas.map((p) => (
              <button key={p.id} type="button" onClick={() => setMensaje(p.texto)} className="btn-secondary text-xs">
                {p.titulo}
              </button>
            ))}
          </div>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={4}
            className="input"
            aria-label="Mensaje de WhatsApp"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={enviar}
              disabled={pending || !mensaje.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 disabled:opacity-60"
            >
              Abrir WhatsApp
            </button>
            <span className="text-xs text-stone-500">
              Se abre WhatsApp con el mensaje listo; tú lo envías. Queda anotado en el seguimiento.
            </span>
            {registrado && <span className="text-sm text-emerald-700">Anotado en el seguimiento.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
