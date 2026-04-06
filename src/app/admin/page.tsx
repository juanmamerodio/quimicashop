"use client";

import { useEffect, useState } from "react";
import { Order } from "@/lib/types";

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchOrders(); // Refresh para ver el nuevo estado
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text p-8 flex items-center justify-center font-jetbrains">
        Cargando panel de administración...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-jetbrains font-bold text-accent mb-8">
          Panel de Administración
        </h1>

        <div className="overflow-x-auto bg-surface border border-white/10 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/20">
                <th className="p-4 font-jetbrains text-sm text-muted">ID / Fecha</th>
                <th className="p-4 font-jetbrains text-sm text-muted">Cliente</th>
                <th className="p-4 font-jetbrains text-sm text-muted">Total</th>
                <th className="p-4 font-jetbrains text-sm text-muted">Estado</th>
                <th className="p-4 font-jetbrains text-sm text-muted">Comprobante</th>
                <th className="p-4 font-jetbrains text-sm text-muted">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted font-jetbrains text-sm">
                    No hay pedidos registrados en el sistema.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <span className="block text-accent font-jetbrains">
                        {order.id?.split("-")[0]}...
                      </span>
                      <span className="text-muted text-xs">
                        {order.created_at &&
                          new Date(order.created_at).toLocaleString("es-AR")}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span className="block font-bold text-text">
                        {order.nombre_cliente}
                      </span>
                      <span className="block text-muted">{order.email}</span>
                      <span className="block text-muted">{order.telefono}</span>
                    </td>
                    <td className="p-4 text-sm font-jetbrains text-text">
                      ${order.total_ars}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold font-jetbrains inline-block ${
                          order.estado === "pendiente"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : order.estado === "comprobante_subido"
                            ? "bg-blue-400/20 text-blue-400"
                            : order.estado === "pre_aprobado"
                            ? "bg-accent/20 text-accent"
                            : order.estado === "enviado"
                            ? "bg-violet/20 text-violet"
                            : order.estado === "rechazado"
                            ? "bg-red-500/20 text-red-500"
                            : "bg-surface text-muted"
                        }`}
                      >
                        {order.estado.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {order.comprobante_url ? (
                        <a
                          href={order.comprobante_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline font-jetbrains text-xs flex items-center gap-1"
                        >
                          Ver Imagen ↗
                        </a>
                      ) : (
                        <span className="text-muted font-jetbrains text-xs">
                          Pendiente
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <select
                        className="bg-black/40 border border-white/10 text-text text-sm rounded px-2 py-1 focus:outline-none focus:border-accent font-jetbrains cursor-pointer"
                        value={order.estado}
                        onChange={(e) => updateOrderStatus(order.id!, e.target.value)}
                      >
                        <option value="pendiente">pendiente</option>
                        <option value="comprobante_subido">comprobante_subido</option>
                        <option value="pre_aprobado">pre_aprobado</option>
                        <option value="enviado">enviado</option>
                        <option value="rechazado">rechazado</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
