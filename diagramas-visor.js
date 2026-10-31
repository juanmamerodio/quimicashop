/**
 * diagramas-visor.js — Visor Académico Interactivo de Diagramas Mermaid
 * Esencia Técnica · E.E.S.T N°1 Luciano Reyes · 7mo Año Programación 2026
 *
 * Módulo desacoplado y profundo que gestiona:
 * 1. Navegación accesible por pestañas (Centro de Control vs Diagramas del Sistema).
 * 2. Renderizado dinámico y secuencial de los 7 diagramas canónicos en Mermaid v10+.
 * 3. Barra de herramientas interactiva (Zoom +, Zoom -, Reset, Paneo por arrastre).
 * 4. Exportación en un clic a SVG vectorial y PNG rasterizado en alta resolución.
 * 5. Copia directa de sintaxis fuente al portapapeles con confirmación visual.
 * 6. Modal de Pantalla Completa para exposiciones técnicas y defensas docentes.
 *
 * Fuentes de verdad:
 * docs/academico/DFD.md, DER.md, CLASES.md, DCU.md y docs/MODELO.md.
 */

(function () {
  'use strict';

  // 1. DEFINICIÓN CANÓNICA DE LOS 7 DIAGRAMAS DEL SISTEMA
  const DIAGRAMAS = [
    {
      id: 'dfd-n0',
      badge: 'DFD N0',
      catedra: 'Cátedra Ariel Leibouski',
      title: 'DFD Nivel 0 · Diagrama de Contexto',
      desc: 'Frontera del sistema de Esencia Técnica frente a sus entidades externas (Cliente, Administrador de Química y Temporizador Cron). Metodología estricta de análisis de sistemas: no contiene almacenes internos.',
      pills: ['Sin almacenes en N0', 'Viernes 23:59 ART', 'Basic Auth'],
      code: `flowchart TD
    %% Entidades Externas
    subgraph EXT_CLI ["Entorno Cliente"]
        direction TB
        E1["Cliente (Comprador Invitado)"]
    end

    subgraph SISTEMA ["Frontera del Sistema · Esencia Técnica"]
        P0(("0. Sistema de Gestión y Venta de Cosmética Esencia Técnica"))
    end

    subgraph EXT_GESTION ["Entorno Gestión y Control"]
        direction TB
        E2["Administrador de Química"]
        E3["Temporizador Semanal (Vercel Cron)"]
    end

    %% Flujos de Cliente
    E1 -->|"Solicitud de catálogo y productos"| P0
    P0 -->|"Catálogo activo y disponibilidad de stock"| E1
    E1 -->|"Datos de contacto y confirmación de compra"| P0
    P0 -->|"Confirmación de pedido y datos de transferencia"| E1
    E1 -->|"Comprobante de transferencia bancaria (foto y monto)"| P0
    P0 -->|"Remito de venta oficial por correo electrónico"| E1

    %% Flujos de Administrador
    E2 -->|"Credenciales de acceso (Basic Auth)"| P0
    E2 -->|"Ajustes de stock, umbrales y catálogo"| P0
    E2 -->|"Validación manual de comprobante (Aprobar / Rechazar)"| P0
    E2 -->|"Atención de alertas de stock"| P0
    P0 -->|"Listado de pedidos y comprobantes pendientes"| E2
    P0 -->|"Alertas de stock bajo en panel (popup)"| E2
    P0 -->|"Estado de inventario y remitos emitidos"| E2

    %% Flujos de Cron
    E3 -->|"Disparo semanal programado (Viernes 23:59 ART)"| P0
    P0 -->|"Resultado de cancelación de pedidos vencidos"| E3`
    },
    {
      id: 'dfd-n1',
      badge: 'DFD N1',
      catedra: 'Cátedra Ariel Leibouski',
      title: 'DFD Nivel 1 · Descomposición General (Almacenes D1–D7)',
      desc: 'Descomposición en 6 procesos principales e identificación de los 7 almacenes canónicos (D1 a D7). Se explicita que el carrito reside en el navegador del cliente sin persistencia en base de datos.',
      pills: ['D1: CLIENTE', 'D2: PRODUCTO', 'D3: STOCK', 'D4: PEDIDO', 'D5: COMPROBANTE', 'D6: REMITO_VENTA', 'D7: ALERTA_STOCK'],
      code: `flowchart TD
    %% Carril 1: Entidades Externas
    subgraph ENTIDADES ["Entidades Externas"]
        subgraph EXT_CLI ["Entorno Cliente"]
            direction TB
            CLI["Cliente (Comprador Invitado)"]
        end
        subgraph EXT_GESTION ["Entorno Gestión y Control"]
            direction TB
            ADM["Administrador de Química"]
            CRON["Temporizador Semanal (Vercel Cron)"]
        end
    end

    %% Carril 2: Procesos Principales
    subgraph PROCESOS ["Procesos Principales"]
        subgraph PROC_VENTA ["Flujo de Venta (Cliente)"]
            direction TB
            P1(("1.0 Consultar Catálogo y Disponibilidad"))
            P2(("2.0 Registrar Pedido y Reservar Stock"))
            P3(("3.0 Gestionar Comprobante y Validación Manual"))
        end
        subgraph PROC_GESTION ["Flujo de Gestión y Control"]
            direction TB
            P4(("4.0 Administrar Catálogo y Stock Físico"))
            P5(("5.0 Controlar Umbrales y Alertas de Stock"))
            P6(("6.0 Cancelar Pedidos Vencidos (Cron)"))
        end
    end

    %% Carril 3: Almacenes Canónicos
    subgraph ALMACENES ["Almacenes de Datos (D1–D7)"]
        subgraph ALM_VENTA ["Almacenes de Venta (Transaccionales)"]
            direction TB
            D1[("D1: CLIENTE")]
            D4[("D4: PEDIDO")]
            D5[("D5: COMPROBANTE")]
            D6[("D6: REMITO_VENTA")]
        end
        subgraph ALM_STOCK ["Almacenes de Catálogo y Stock"]
            direction TB
            D2[("D2: PRODUCTO")]
            D3[("D3: STOCK")]
            D7[("D7: ALERTA_STOCK")]
        end
    end

    %% Flujos Proceso 1.0
    CLI -->|"Consulta de cosmética<br/>e higiene"| P1
    D2 -->|"Productos activos"| P1
    D3 -->|"Stock actual y reservado"| P1
    P1 -->|"Vista de catálogo con<br/>disponibilidad real"| CLI

    %% Flujos Proceso 2.0 (Carrito en cliente -> Pedido en BD)
    CLI -->|"Confirmación de compra<br/>(desde carrito en cliente)"| P2
    P2 -->|"Upsert datos de contacto<br/>por email"| D1
    P2 -->|"Registro de pedido<br/>pendiente y detalle"| D4
    P2 -->|"Incrementa cantidad_reservada<br/>(RPC crear_pedido)"| D3
    P2 -->|"Número de pedido y<br/>datos de Cooperadora"| CLI

    %% Flujos Proceso 3.0
    CLI -->|"Subida de comprobante<br/>(foto y monto)"| P3
    P3 -->|"Guarda comprobante<br/>(Comprobante Subido)"| D5
    D4 -->|"Lectura de pedidos<br/>para cotejo"| P3
    D5 -->|"Lectura de comprobantes<br/>para revisión"| P3
    P3 -->|"Pedidos y comprobantes<br/>pendientes"| ADM
    ADM -->|"Decisión de validación<br/>manual (Aprobar / Rechazar)"| P3
    P3 -->|"Aprobado: estado Pago Validado<br/>Rechazado: estado Rechazado"| D4
    P3 -->|"Aprobado: descuenta stock y libera reserva<br/>Rechazado: libera reserva"| D3
    P3 -->|"Genera remito de venta<br/>con número oficial"| D6
    P3 -->|"Despacha remito HTML<br/>por correo electrónico"| CLI

    %% Flujos Proceso 4.0
    ADM -->|"Actualización de productos<br/>e inventario"| P4
    P4 -->|"Baja lógica y<br/>edición de productos"| D2
    P4 -->|"Ajuste de cantidad_actual<br/>y cantidad_warning"| D3

    %% Flujos Proceso 5.0
    D3 -->|"Monitoreo de stock<br/>disponible"| P5
    P5 -->|"Genera alerta si<br/>disponible <= warning"| D7
    D7 -->|"Lectura de alertas<br/>pendientes"| P5
    P5 -->|"Popup informativo<br/>de stock bajo"| ADM
    ADM -->|"Marca alerta como atendida"| P5
    P5 -->|"Actualiza atendida = true"| D7

    %% Flujos Proceso 6.0
    CRON -->|"Disparo semanal programado<br/>(Viernes 23:59 ART)"| P6
    D4 -->|"Consulta de pedidos<br/>Pendiente de Pago"| P6
    P6 -->|"Actualiza pedidos<br/>a Cancelado"| D4
    P6 -->|"Actualiza comprobantes<br/>a Rechazado"| D5
    P6 -->|"Libera cantidad_reservada en stock<br/>(RPC cancelar_pedidos_vencidos)"| D3
    P6 -->|"Reporte de ejecución con<br/>pedidos cancelados"| CRON`
    },
    {
      id: 'dfd-n2',
      badge: 'DFD N2',
      catedra: 'Cátedra Ariel Leibouski',
      title: 'DFD Nivel 2 · Subsistemas de Procesos',
      desc: 'Descomposición del subsistema de pedidos, comprobantes en storage privado y validación manual sin IA con emisión de remito y despacho por correo electrónico.',
      pills: ['Subida a Storage', 'Cotejo Manual', 'Remito Correlativo', 'Reserva Atómica'],
      code: `flowchart TD
    %% Actores Externos
    subgraph ACTORES ["Actores Externos"]
        direction LR
        CLI["Cliente (Comprador Invitado)"]
        ADM["Administrador de Química"]
    end

    %% Subsistemas de Procesos
    subgraph SUB_PEDIDO ["Subsistema 2.0: Pedido y Reserva"]
        direction TB
        P21(("2.1 Validar Disponibilidad y Crear Pedido"))
        P22(("2.2 Registrar Reserva de Stock"))
    end

    subgraph SUB_COMPROBANTE ["Subsistema 3.0: Comprobante y Cotejo"]
        direction TB
        P31(("3.1 Subir Comprobante a Storage y BD"))
        P32(("3.2 Cotejo Manual de Imagen y Monto"))
    end

    subgraph SUB_RESOLUCION ["Subsistema 3.0: Resolución y Remito"]
        direction TB
        P33(("3.3 Ejecutar Aprobación y Venta"))
        P34(("3.4 Ejecutar Rechazo"))
        P35(("3.5 Despachar Remito de Venta por Email"))
    end

    %% Almacenes Involucrados
    subgraph ALMACENES ["Almacenes de Persistencia"]
        direction TB
        D1[("D1: CLIENTE")]
        D3[("D3: STOCK")]
        D4[("D4: PEDIDO")]
        D5[("D5: COMPROBANTE")]
        D6[("D6: REMITO_VENTA")]
    end

    %% Flujos de Creación de Pedido
    CLI -->|"Envío de pedido (items desde carrito del cliente + contacto)"| P21
    P21 -->|"Upsert cliente por email"| D1
    P21 -->|"Verifica disponible = cantidad_actual - cantidad_reservada"| D3
    P21 -->|"Inserta pedido en estado Pendiente de Pago y detalle"| D4
    P21 -->|"Solicita reserva de unidades"| P22
    P22 -->|"Incrementa cantidad_reservada en stock"| D3
    P21 -->|"Informa total y datos bancarios para transferencia"| CLI

    %% Flujos de Comprobante
    CLI -->|"Carga foto de comprobante y monto transferido"| P31
    P31 -->|"Inserta comprobante con estado Comprobante Subido"| D5
    P31 -->|"Vincula comprobante con el pedido"| D4

    %% Validación Manual
    D4 -->|"Datos de pedido y total esperado"| P32
    D5 -->|"Imagen de transferencia y monto declarado"| P32
    P32 -->|"Presenta en panel pedidos y comprobantes"| ADM
    ADM -->|"Orden de aprobación (monto coincide con total)"| P33
    ADM -->|"Orden de rechazo (monto incorrecto o imagen apócrifa)"| P34

    %% Desenlace de Aprobación
    P33 -->|"Actualiza pedido a Pago Validado con historial"| D4
    P33 -->|"Actualiza comprobante a Aprobado por Admin"| D5
    P33 -->|"Convierte reserva en venta (resta actual y reservada)"| D3
    P33 -->|"Genera remito de venta con número oficial único"| D6
    P33 -->|"Dispara despacho del remito"| P35

    %% Desenlace de Rechazo
    P34 -->|"Actualiza pedido a Rechazado con historial"| D4
    P34 -->|"Actualiza comprobante a Rechazado"| D5
    P34 -->|"Libera cantidad_reservada en stock"| D3

    %% Despacho de Remito
    D6 -->|"Datos de remito y número correlativo"| P35
    D1 -->|"Correo electrónico del comprador"| P35
    P35 -->|"Envío de remito HTML al cliente (Resend)"| CLI`
    },
    {
      id: 'dfd-n3',
      badge: 'DFD N3',
      catedra: 'Cátedra Ariel Leibouski',
      title: 'DFD Nivel 3 · Detalle Operativo Transaccional',
      desc: 'Detalle transaccional atómico de crear_pedido (reserva de stock sin sobreventa) y aprobar_comprobante (descuento físico, remito R-YYYY-NNNNNN y actualización concurrente de historial).',
      pills: ['RPC crear_pedido', 'RPC aprobar_comprobante', 'Descuento Físico', 'Liberación de Reserva'],
      code: `flowchart TD
    %% Actores Externos
    subgraph ACTORES ["Actores del Sistema"]
        direction LR
        CLI["Cliente (Navegador)"]
        ADM["Administrador de Química"]
    end

    %% Almacenes Involucrados
    subgraph ALMACENES ["Almacenes de Persistencia"]
        direction TB
        D1[("D1: CLIENTE")]
        D2[("D2: PRODUCTO")]
        D3[("D3: STOCK")]
        D4[("D4: PEDIDO")]
        D5[("D5: COMPROBANTE")]
        D6[("D6: REMITO_VENTA")]
    end

    %% Transacciones Atómicas
    subgraph TX1 ["Transacción crear_pedido (Reserva de Stock)"]
        direction TB
        P211(("2.1.1 Recibir Carrito y Contacto"))
        P212(("2.1.2 Upsert Cliente por Email"))
        P213(("2.1.3 Validar Actividad y Stock Disponible"))
        P214(("2.1.4 Calcular Subtotal y Total en BD"))
        P215(("2.1.5 Insertar Pedido y Detalle con Historial"))
        P216(("2.1.6 Incrementar Reserva de Stock"))
    end

    subgraph TX2 ["Transacción aprobar_comprobante (Venta y Remito)"]
        direction TB
        P331(("3.3.1 Cotejar Monto Comprobante vs Total"))
        P332(("3.3.2 Transición Atómica de Estados"))
        P333(("3.3.3 Descontar Stock Físico y Liberar Reserva"))
        P334(("3.3.4 Generar Remito de Venta Correlativo"))
        P335(("3.3.5 Despachar Correo Asíncrono Resend"))
    end

    CLI -->|"Items desde carrito en cliente"| P211
    P211 --> P212
    P212 -->|"Upsert email/dni"| D1
    P212 --> P213
    D2 -->|"producto.activo = true"| P213
    D3 -->|"disponible >= cantidad"| P213
    P213 --> P214
    D2 -->|"precio vigente"| P214
    P214 --> P215
    P215 -->|"Inserta Pedido y Detalle"| D4
    P215 --> P216
    P216 -->|"cantidad_reservada += cantidad"| D3
    P216 -->|"Número de pedido"| CLI

    ADM -->|"Aprobar comprobante revisado"| P331
    D5 -->|"monto comprobante"| P331
    D4 -->|"total pedido"| P331
    P331 -->|"Monto coincide exacto"| P332
    P332 -->|"Pago Validado"| D4
    P332 -->|"Aprobado por Admin"| D5
    P332 --> P333
    P333 -->|"actual -= cant / reservada -= cant"| D3
    P333 --> P334
    P334 -->|"Inserta R-YYYY-NNNNNN"| D6
    P334 --> P335
    P335 -->|"Envío email remito HTML"| CLI`
    },
    {
      id: 'der',
      badge: 'DER 3FN',
      catedra: 'Cátedra Isabella Infante · BD',
      title: 'DER · Modelo Relacional Normalizado en 3FN',
      desc: 'Modelo relacional normalizado en 3FN del MVP. 10 entidades canónicas en la base viva otjph…, tipos monetarios NUMERIC(12,2) con precio > 0 y monto > 0, y delimitación de Fase 2.',
      pills: ['10 Entidades Canónicas', '3ra Forma Normal', 'Monto > 0', 'Precio > 0', 'Fase 2 Delimitada'],
      code: `erDiagram
    CLIENTE ||--o{ PEDIDO : realiza
    CLIENTE ||--o{ REMITO_VENTA : recibe

    PRODUCTO ||--|| STOCK : tiene
    PRODUCTO ||--o{ DETALLE_PEDIDO : aparece

    PEDIDO ||--o{ DETALLE_PEDIDO : contiene
    PEDIDO ||--o{ ESTADO_PEDIDO : registra
    PEDIDO ||--o{ COMPROBANTE : presenta

    COMPROBANTE ||--o{ ESTADO_COMPROBANTE : registra
    COMPROBANTE ||--o| REMITO_VENTA : genera

    STOCK ||--o{ ALERTA_STOCK : dispara

    CLIENTE {
        int id_cliente PK
        string dni
        string nombre
        string email
        string telefono
    }

    PRODUCTO {
        int id_producto PK
        string nombre
        string categoria
        string tipo
        string descripcion
        decimal precio
        int tiempo_produccion
        boolean activo
        string imagen_url
    }

    STOCK {
        int id_stock PK
        int id_producto FK
        int cantidad_actual
        int cantidad_reservada
        int cantidad_warning
    }

    PEDIDO {
        int id_pedido PK
        int id_cliente FK
        date fecha
        decimal total
        string estado_actual
    }

    DETALLE_PEDIDO {
        int id_detalle_pedido PK
        int id_pedido FK
        int id_producto FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
    }

    ESTADO_PEDIDO {
        int id_estado_pedido PK
        int id_pedido FK
        string estado
        date fecha
    }

    COMPROBANTE {
        int id_comprobante PK
        int id_pedido FK
        string foto_url
        date fecha
        decimal monto
        string estado_actual
    }

    ESTADO_COMPROBANTE {
        int id_estado_comprobante PK
        int id_comprobante FK
        string estado
        date fecha
    }

    REMITO_VENTA {
        int id_remito PK
        int id_comprobante FK
        int id_cliente FK
        date fecha
        decimal total
        string numero
    }

    ALERTA_STOCK {
        int id_alerta PK
        int id_stock FK
        date fecha
        string mensaje
        boolean atendida
    }`
    },
    {
      id: 'clases-uml',
      badge: 'Clases UML',
      catedra: 'Cátedra Alejandro Nieva',
      title: 'Diagrama de Clases UML · Entidades y Servicios',
      desc: 'Arquitectura orientada a objetos del sistema. 10 clases de dominio canónicas con métodos de negocio y 6 servicios de dominio de aplicación (Checkout, Catálogo, Admin, Remito, Cron, Storage).',
      pills: ['10 Entidades de Dominio', '6 Servicios de Aplicación', 'Sin IA', 'Basic Auth'],
      code: `classDiagram
    direction TB

    %% ==========================================
    %% ENTIDADES CANÓNICAS DEL DOMINIO
    %% ==========================================

    class Cliente {
        +int id_cliente
        +string dni
        +string nombre
        +string email
        +string telefono
        +obtenerIdentificador() string
        +validarContacto() boolean
    }

    class Producto {
        +int id_producto
        +string nombre
        +string categoria
        +string tipo
        +string descripcion
        +decimal precio
        +int tiempo_produccion
        +boolean activo
        +string imagen_url
        +estaDisponible() boolean
        +darDeBaja() void
    }

    class Stock {
        +int id_stock
        +int id_producto
        +int cantidad_actual
        +int cantidad_reservada
        +int cantidad_warning
        +calcularDisponible() int
        +hayStockSuficiente(cantidad: int) boolean
        +estaEnAlerta() boolean
        +reservar(cantidad: int) void
        +descontarVenta(cantidad: int) void
        +liberarReserva(cantidad: int) void
    }

    class Pedido {
        +int id_pedido
        +int id_cliente
        +date fecha
        +decimal total
        +string estado_actual
        +calcularTotal() decimal
        +cambiarEstado(nuevoEstado: string) void
        +estaPendiente() boolean
    }

    class DetallePedido {
        +int id_detalle_pedido
        +int id_pedido
        +int id_producto
        +int cantidad
        +decimal precio_unitario
        +decimal subtotal
        +calcularSubtotal() decimal
    }

    class EstadoPedido {
        +int id_estado_pedido
        +int id_pedido
        +string estado
        +date fecha
    }

    class Comprobante {
        +int id_comprobante
        +int id_pedido
        +string foto_url
        +date fecha
        +decimal monto
        +string estado_actual
        +coincideConTotal(totalPedido: decimal) boolean
        +cambiarEstado(nuevoEstado: string) void
    }

    class EstadoComprobante {
        +int id_estado_comprobante
        +int id_comprobante
        +string estado
        +date fecha
    }

    class RemitoVenta {
        +int id_remito
        +int id_comprobante
        +int id_cliente
        +date fecha
        +decimal total
        +string numero
        +generarNumero() string
        +obtenerEncabezado() string
    }

    class AlertaStock {
        +int id_alerta
        +int id_stock
        +date fecha
        +string mensaje
        +boolean atendida
        +marcarAtendida() void
    }

    %% ==========================================
    %% SERVICIOS DE DOMINIO Y APLICACIÓN
    %% ==========================================

    class ServicioCheckout {
        +crearPedido(cliente: Cliente, items: list) Pedido
        +cargarComprobante(idPedido: int, fotoUrl: string, monto: decimal) Comprobante
        +validarCarrito(items: list) boolean
    }

    class ServicioCatalogo {
        +obtenerProductosActivos() list
        +consultarDisponibilidad(idProducto: int) int
        +buscar(criterio: string) list
        +filtrarPorCategoria(categoria: string) list
    }

    class ServicioAdmin {
        +aprobarComprobante(idComprobante: int) RemitoVenta
        +rechazarComprobante(idComprobante: int, motivo: string) void
        +obtenerAlertasSinAtender() list
        +marcarAlertaAtendida(idAlerta: int) void
        +actualizarStock(idStock: int, nuevoStock: int) void
        +listarPedidos(filtroEstado: string) list
    }

    class ServicioRemito {
        +generarRemito(comprobante: Comprobante, pedido: Pedido, cliente: Cliente) RemitoVenta
        +componerRemitoHtml(remito: RemitoVenta) string
        +despacharEmail(remito: RemitoVenta, cliente: Cliente) boolean
    }

    class ServicioCron {
        +cancelarPedidosVencidos() int
        +liberarReservasExpiradas() void
    }

    class ServicioStorage {
        +subirComprobante(archivo: bytes, clave: string) string
        +firmarUrlComprobante(clave: string) string
        +obtenerUrlPublica(clave: string) string
    }

    %% ==========================================
    %% RELACIONES ESTRUCTURALES
    %% ==========================================

    Cliente "1" --> "*" Pedido : realiza
    Cliente "1" --> "*" RemitoVenta : recibe
    Producto "1" -- "1" Stock : tiene
    Producto "1" --> "*" DetallePedido : aparece
    Pedido "1" *-- "*" DetallePedido : contiene
    Pedido "1" *-- "*" EstadoPedido : registra
    Pedido "1" o-- "*" Comprobante : presenta
    Comprobante "1" *-- "*" EstadoComprobante : registra
    Comprobante "1" --> "0..1" RemitoVenta : origina
    Stock "1" --> "*" AlertaStock : dispara

    %% ==========================================
    %% DEPENDENCIAS DE SERVICIOS
    %% ==========================================

    ServicioCheckout ..> Pedido : gestiona
    ServicioCheckout ..> Cliente : asocia
    ServicioCheckout ..> Stock : reserva
    ServicioCatalogo ..> Producto : consulta
    ServicioCatalogo ..> Stock : evalua
    ServicioAdmin ..> Comprobante : valida
    ServicioAdmin ..> Pedido : actualiza
    ServicioAdmin ..> Stock : ajusta
    ServicioAdmin ..> AlertaStock : atiende
    ServicioAdmin ..> RemitoVenta : emite
    ServicioRemito ..> RemitoVenta : genera
    ServicioRemito ..> Cliente : notifica
    ServicioCron ..> Pedido : cancela
    ServicioCron ..> Stock : libera
    ServicioStorage ..> Comprobante : almacena`
    },
    {
      id: 'dcu',
      badge: 'DCU',
      catedra: 'Cátedra Celeste Cáceres · QA',
      title: 'DCU · Diagrama de Casos de Uso',
      desc: 'Casos de uso del sistema escolar con validación manual sin IA (ADR 0002), carrito en navegador, temporizador semanal de los viernes 23:59 ART y relaciones include/extend.',
      pills: ['Validación Manual sin IA', 'Carrito en Navegador', 'Cron Semanal', 'Include / Extend'],
      code: `flowchart LR
    %% Actores
    subgraph Actores ["Actores del Sistema"]
        A_Cliente["fa:fa-user Cliente<br/>(Comprador Invitado)"]
        A_Admin["fa:fa-user-tie Administrador de Química<br/>(Personal del Taller)"]
        A_Cron["fa:fa-clock Temporizador Cron<br/>(Viernes 23:59 ART)"]
    end

    %% Límite del Sistema
    subgraph Sistema ["Sistema E-Commerce Esencia Técnica"]
        CU01(["CU01: Consultar catálogo y disponibilidad"])
        CU02(["CU02: Administrar carrito en navegador"])
        CU03(["CU03: Confirmar pedido y reservar stock"])
        CU04(["CU04: Cargar comprobante de pago y monto"])
        CU05(["CU05: Recibir Remito de venta por email"])
        CU06(["CU06: Visualizar noticias e info institucional"])

        CU07(["CU07: Autenticarse en panel /admin"])
        CU08(["CU08: Validar comprobante manualmente (sin IA)"])
        CU08A(["CU08a: Aprobar pago y emitir remito"])
        CU08B(["CU08b: Rechazar pago y liberar reserva"])

        CU09(["CU09: Gestionar stock e inventario"])
        CU10(["CU10: Gestionar catálogo de productos"])
        CU11(["CU11: Atender alertas de stock en popup"])

        CU12(["CU12: Cancelar pedidos vencidos semanalmente"])
        CU12A(["CU12a: Liberar unidades reservadas"])
        CU12B(["CU12b: Rechazar comprobantes pendientes"])
    end

    %% Relaciones Cliente
    A_Cliente --> CU01
    A_Cliente --> CU02
    A_Cliente --> CU03
    A_Cliente --> CU04
    A_Cliente --> CU05
    A_Cliente --> CU06

    CU03 -.->|"<<include>>"| CU01

    %% Relaciones Administrador
    A_Admin --> CU07
    A_Admin --> CU08
    A_Admin --> CU09
    A_Admin --> CU10
    A_Admin --> CU11

    CU08 -.->|"<<extend>>"| CU08A
    CU08 -.->|"<<extend>>"| CU08B
    CU08 -.->|"<<include>>"| CU07

    %% Relaciones Temporizador Cron
    A_Cron --> CU12
    CU12 -.->|"<<include>>"| CU12A
    CU12 -.->|"<<include>>"| CU12B`
    }
  ];

  // ESTADO INTERACTIVO DE ZOOM Y PANEO POR DIAGRAMA
  const transformState = {};

  function initTransformState(id) {
    if (!transformState[id]) {
      transformState[id] = {
        scale: 1,
        translateX: 0,
        translateY: 0,
        isDragging: false,
        startX: 0,
        startY: 0
      };
    }
    return transformState[id];
  }

  function aplicarTransform(id, targetEl) {
    const s = initTransformState(id);
    const el = targetEl || document.querySelector(`#stage-${id} .diagram-svg-wrap`);
    if (el) {
      el.style.transform = `translate(${s.translateX}px, ${s.translateY}px) scale(${s.scale})`;
    }
  }

  // ACCIONES INTERACTIVAS
  function zoomIn(id, targetEl) {
    const s = initTransformState(id);
    s.scale = Math.min(s.scale * 1.25, 4.0);
    aplicarTransform(id, targetEl);
  }

  function zoomOut(id, targetEl) {
    const s = initTransformState(id);
    s.scale = Math.max(s.scale / 1.25, 0.35);
    aplicarTransform(id, targetEl);
  }

  function zoomReset(id, targetEl) {
    const s = initTransformState(id);
    s.scale = 1;
    s.translateX = 0;
    s.translateY = 0;
    aplicarTransform(id, targetEl);
  }

  function attachPanEvents(stageEl, id, targetSvgWrap) {
    const s = initTransformState(id);

    const onPointerDown = (e) => {
      s.isDragging = true;
      s.startX = e.clientX - s.translateX;
      s.startY = e.clientY - s.translateY;
      stageEl.style.cursor = 'grabbing';
      if (stageEl.setPointerCapture && e.pointerId !== undefined) {
        try {
          stageEl.setPointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    const onPointerMove = (e) => {
      if (!s.isDragging) return;
      s.translateX = e.clientX - s.startX;
      s.translateY = e.clientY - s.startY;
      aplicarTransform(id, targetSvgWrap);
    };

    const onPointerUp = (e) => {
      if (!s.isDragging) return;
      s.isDragging = false;
      stageEl.style.cursor = 'grab';
      if (stageEl.releasePointerCapture && e.pointerId !== undefined) {
        try {
          stageEl.releasePointerCapture(e.pointerId);
        } catch (_) {}
      }
    };

    // Eventos de puntero universales (mouse y touch)
    stageEl.addEventListener('pointerdown', onPointerDown);
    stageEl.addEventListener('pointermove', onPointerMove);
    stageEl.addEventListener('pointerup', onPointerUp);
    stageEl.addEventListener('pointercancel', onPointerUp);
    stageEl.addEventListener('pointerleave', onPointerUp);

    // Compatibilidad adicional mouse clásico
    stageEl.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', (e) => {
      if (s.isDragging) onPointerMove(e);
    });
    window.addEventListener('mouseup', () => {
      if (s.isDragging) onPointerUp({});
    });

    // Compatibilidad touch clásica
    stageEl.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches[0]) {
        onPointerDown(e.touches[0]);
      }
    }, { passive: true });
    stageEl.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        onPointerMove(e.touches[0]);
      }
    }, { passive: true });
    stageEl.addEventListener('touchend', onPointerUp);
  }

  // COPIAR SINTAXIS MERMAID AL PORTAPAPELES
  function copiarMermaid(id, btn) {
    const item = DIAGRAMAS.find((d) => d.id === id);
    if (!item) return;

    const texto = item.code;
    const okFeedback = () => {
      const originalText = btn.innerHTML;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span style="color:#10b981;font-weight:700">¡Copiado!</span>
      `;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(okFeedback).catch(() => {
        fallbackCopy(texto, okFeedback);
      });
    } else {
      fallbackCopy(texto, okFeedback);
    }
  }

  function fallbackCopy(texto, cb) {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      if (cb) cb();
    } catch (err) {
      console.warn('No se pudo copiar el texto:', err);
    }
    document.body.removeChild(ta);
  }

  // DESCARGA VECTORIAL SVG
  function descargarSvg(id) {
    const svgWrap = document.querySelector(`#stage-${id} .diagram-svg-wrap`);
    if (!svgWrap) return;
    const svgEl = svgWrap.querySelector('svg');
    if (!svgEl) return;

    let svgData = svgEl.outerHTML;
    if (!svgData.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `esencia-tecnica-${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // DESCARGA RASTERIZADA PNG (CANVAS)
  function descargarPng(id) {
    const svgWrap = document.querySelector(`#stage-${id} .diagram-svg-wrap`);
    if (!svgWrap) return;
    const svgEl = svgWrap.querySelector('svg');
    if (!svgEl) return;

    let svgData = svgEl.outerHTML;
    if (!svgData.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      svgData = svgData.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = function () {
      const bbox = svgEl.getBBox ? svgEl.getBBox() : { width: 800, height: 600 };
      const width = Math.max(bbox.width + 80, 1000);
      const height = Math.max(bbox.height + 80, 700);

      const canvas = document.createElement('canvas');
      const scale = 2; // Alta nitidez Retina / 2x
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 40, 40, bbox.width || (width - 80), bbox.height || (height - 80));

      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `esencia-tecnica-${id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pngUrl);
        URL.revokeObjectURL(url);
      }, 'image/png');
    };

    img.src = url;
  }

  // ALTERNAR ENTRE GRÁFICO SVG Y CÓDIGO FUENTE
  function alternarCodigo(id, btn) {
    const stage = document.getElementById(`stage-${id}`);
    if (!stage) return;

    const svgWrap = stage.querySelector('.diagram-svg-wrap');
    const codeWrap = stage.querySelector('.diagram-code-wrap');

    if (!svgWrap || !codeWrap) return;

    const mostrandoCodigo = !codeWrap.hidden;
    if (mostrandoCodigo) {
      codeWrap.hidden = true;
      svgWrap.hidden = false;
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      codeWrap.hidden = false;
      svgWrap.hidden = true;
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
    }
  }

  // MODAL DE PANTALLA COMPLETA
  let modalActiveId = null;

  function abrirPantallaCompleta(id) {
    modalActiveId = id;
    const modal = document.getElementById('diagram-fullscreen-modal');
    if (!modal) return;

    const item = DIAGRAMAS.find((d) => d.id === id);
    if (!item) return;

    const modalTitle = document.getElementById('modal-diagram-title');
    const modalBadge = document.getElementById('modal-diagram-badge');
    const modalSvgContainer = document.getElementById('modal-svg-stage');

    if (modalTitle) modalTitle.textContent = item.title;
    if (modalBadge) modalBadge.textContent = item.badge;

    // Clonar el SVG renderizado
    const originalSvg = document.querySelector(`#stage-${id} .diagram-svg-wrap svg`);
    if (modalSvgContainer && originalSvg) {
      modalSvgContainer.innerHTML = '';
      const svgClone = originalSvg.cloneNode(true);
      const cloneWrap = document.createElement('div');
      cloneWrap.className = 'diagram-svg-wrap modal-svg-wrap';
      cloneWrap.style.transformOrigin = 'center center';
      cloneWrap.appendChild(svgClone);
      modalSvgContainer.appendChild(cloneWrap);

      // Reset transform para el modal
      const modalStateId = 'modal-' + id;
      initTransformState(modalStateId);
      zoomReset(modalStateId, cloneWrap);
      attachPanEvents(modalSvgContainer, modalStateId, cloneWrap);
    }

    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  }

  function cerrarPantallaCompleta() {
    const modal = document.getElementById('diagram-fullscreen-modal');
    if (modal) {
      modal.hidden = true;
    }
    document.body.style.overflow = '';
    modalActiveId = null;
  }

  // 2. CONSTRUCCIÓN DEL CONTENIDO EN EL PANEL DE DIAGRAMAS
  let diagramasRenderizados = false;

  async function renderizarDiagramas() {
    if (diagramasRenderizados) return;

    const container = document.getElementById('diagramas-grid-container');
    if (!container) return;

    container.innerHTML = '';

    // Inicializar Mermaid
    if (window.mermaid) {
      try {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'base',
          themeVariables: {
            primaryColor: '#e8f3ef',
            primaryTextColor: '#1c1c1e',
            primaryBorderColor: '#3d8c6e',
            lineColor: '#2d6a4f',
            secondaryColor: '#f5f5f3',
            tertiaryColor: '#ffffff',
            background: '#ffffff',
            mainBkg: '#f9fbf9',
            nodeBorder: '#3d8c6e',
            clusterBkg: '#f8faf9',
            clusterBorder: '#cce3d8',
            titleColor: '#1c1c1e',
            fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, sans-serif'
          },
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'linear',
            nodeSpacing: 40,
            rankSpacing: 45
          },
          er: { useMaxWidth: false },
          class: { useMaxWidth: false }
        });
      } catch (e) {
        console.warn('Error inicializando Mermaid:', e);
      }
    }

    for (let i = 0; i < DIAGRAMAS.length; i++) {
      const item = DIAGRAMAS[i];
      const card = document.createElement('article');
      card.className = 'diagram-card';
      card.id = `card-${item.id}`;

      const pillsHtml = (item.pills || [])
        .map((p) => `<span class="diagram-pill">${p}</span>`)
        .join('');

      card.innerHTML = `
        <header class="diagram-card-head">
          <div class="diagram-title-area">
            <div class="diagram-meta-row">
              <span class="cbadge">${item.badge}</span>
              <span class="diagram-catedra">${item.catedra}</span>
            </div>
            <h3 class="diagram-title">${item.title}</h3>
            <p class="diagram-desc">${item.desc}</p>
            <div class="diagram-pills-row">${pillsHtml}</div>
          </div>

          <div class="diagram-toolbar" role="toolbar" aria-label="Herramientas del diagrama ${item.badge}">
            <button type="button" class="btn-tool btn-toggle-code" data-id="${item.id}"
              title="Alternar entre Gráfico SVG y Código Mermaid" aria-label="Alternar Código/Gráfico">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              <span>Código</span>
            </button>

            <button type="button" class="btn-tool btn-zoom-out" data-id="${item.id}"
              title="Reducir Zoom (-)" aria-label="Reducir Zoom">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>

            <button type="button" class="btn-tool btn-zoom-reset" data-id="${item.id}"
              title="Restablecer Zoom (1:1)" aria-label="Restablecer Zoom">
              1:1
            </button>

            <button type="button" class="btn-tool btn-zoom-in" data-id="${item.id}"
              title="Aumentar Zoom (+)" aria-label="Aumentar Zoom">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </button>

            <button type="button" class="btn-tool btn-copy-code" data-id="${item.id}"
              title="Copiar sintaxis Mermaid" aria-label="Copiar código Mermaid">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>Copiar Mermaid</span>
            </button>

            <button type="button" class="btn-tool btn-download-svg" data-id="${item.id}"
              title="Descargar imagen vectorial SVG" aria-label="Descargar SVG">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Descargar SVG</span>
            </button>

            <button type="button" class="btn-tool btn-download-png" data-id="${item.id}"
              title="Descargar imagen PNG" aria-label="Descargar PNG">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span>PNG</span>
            </button>

            <button type="button" class="btn-tool btn-fullscreen" data-id="${item.id}"
              title="Maximizar en Pantalla Completa" aria-label="Pantalla Completa">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 3 21 3 21 9"/>
                <polyline points="9 21 3 21 3 15"/>
                <line x1="21" y1="3" x2="14" y2="10"/>
                <line x1="3" y1="21" x2="10" y2="14"/>
              </svg>
            </button>
          </div>
        </header>

        <div class="diagram-stage" id="stage-${item.id}" tabindex="0"
          aria-label="Área interactiva de exploración del diagrama ${item.badge}">
          <div class="diagram-viewport">
            <div class="diagram-svg-wrap" style="cursor: grab;">
              <div class="diagram-loading">
                <span class="loading-spinner"></span>
                <span>Renderizando diagrama vectorial...</span>
              </div>
            </div>
            <div class="diagram-code-wrap" hidden>
              <pre><code class="language-mermaid">${escapeHtml(item.code)}</code></pre>
            </div>
          </div>
          <div class="stage-hint">Arrastrá para panear · Zoom con botones o rueda</div>
        </div>
      `;

      container.appendChild(card);

      // Renderizado Mermaid para esta tarjeta
      const stageEl = card.querySelector(`#stage-${item.id}`);
      const svgWrap = card.querySelector('.diagram-svg-wrap');

      if (window.mermaid) {
        try {
          const uniqueId = `mermaid-${item.id.replace(/-/g, '_')}-${Date.now()}`;
          const renderResult = await mermaid.render(uniqueId, item.code);
          svgWrap.innerHTML = renderResult.svg;
          attachPanEvents(stageEl, item.id, svgWrap);
        } catch (err) {
          console.warn(`Error renderizando Mermaid para ${item.id}:`, err);
          svgWrap.innerHTML = `
            <div class="diagram-fallback-notice">
              <p>Visualizando código fuente Mermaid (entorno offline o CDN no disponible):</p>
              <pre><code>${escapeHtml(item.code)}</code></pre>
            </div>
          `;
        }
      } else {
        svgWrap.innerHTML = `
          <div class="diagram-fallback-notice">
            <pre><code>${escapeHtml(item.code)}</code></pre>
          </div>
        `;
      }
    }

    // Vincular listeners globales de botones en tarjetas
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const id = btn.getAttribute('data-id');
      if (!id) return;

      if (btn.classList.contains('btn-zoom-in')) {
        zoomIn(id);
      } else if (btn.classList.contains('btn-zoom-out')) {
        zoomOut(id);
      } else if (btn.classList.contains('btn-zoom-reset')) {
        zoomReset(id);
      } else if (btn.classList.contains('btn-copy-code')) {
        copiarMermaid(id, btn);
      } else if (btn.classList.contains('btn-download-svg')) {
        descargarSvg(id);
      } else if (btn.classList.contains('btn-download-png')) {
        descargarPng(id);
      } else if (btn.classList.contains('btn-toggle-code')) {
        alternarCodigo(id, btn);
      } else if (btn.classList.contains('btn-fullscreen')) {
        abrirPantallaCompleta(id);
      }
    });

    diagramasRenderizados = true;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 3. NAVEGACIÓN ACCESIBLE POR PESTAÑAS (TABS)
  function activarTab(tabName, updateHash = true) {
    const tabCentro = document.getElementById('tab-centro');
    const tabDiagramas = document.getElementById('tab-diagramas');
    const panelCentro = document.getElementById('panel-centro');
    const panelDiagramas = document.getElementById('panel-diagramas');

    if (!tabCentro || !tabDiagramas || !panelCentro || !panelDiagramas) return;

    if (tabName === 'diagramas') {
      tabCentro.setAttribute('aria-selected', 'false');
      tabCentro.tabIndex = -1;
      tabCentro.classList.remove('active');

      tabDiagramas.setAttribute('aria-selected', 'true');
      tabDiagramas.tabIndex = 0;
      tabDiagramas.classList.add('active');

      panelCentro.hidden = true;
      panelCentro.classList.remove('active');

      panelDiagramas.hidden = false;
      panelDiagramas.classList.add('active');

      if (updateHash) {
        history.replaceState(null, '', '#diagramas');
      }

      // Renderizado bajo demanda
      renderizarDiagramas();
    } else {
      tabCentro.setAttribute('aria-selected', 'true');
      tabCentro.tabIndex = 0;
      tabCentro.classList.add('active');

      tabDiagramas.setAttribute('aria-selected', 'false');
      tabDiagramas.tabIndex = -1;
      tabDiagramas.classList.remove('active');

      panelCentro.hidden = false;
      panelCentro.classList.add('active');

      panelDiagramas.hidden = true;
      panelDiagramas.classList.remove('active');

      if (updateHash && window.location.hash === '#diagramas') {
        history.replaceState(null, '', window.location.pathname);
      }
    }
  }

  // 4. CONFIGURACIÓN DEL MODAL Y SUS CONTROLES
  function initModalControls() {
    const modal = document.getElementById('diagram-fullscreen-modal');
    if (!modal) return;

    const btnClose = document.getElementById('modal-btn-close');
    const btnZoomIn = document.getElementById('modal-btn-zoom-in');
    const btnZoomOut = document.getElementById('modal-btn-zoom-out');
    const btnReset = document.getElementById('modal-btn-reset');
    const btnDownloadSvg = document.getElementById('modal-btn-download-svg');
    const btnDownloadPng = document.getElementById('modal-btn-download-png');
    const btnCopy = document.getElementById('modal-btn-copy');

    if (btnClose) btnClose.addEventListener('click', cerrarPantallaCompleta);

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        if (modalActiveId) {
          const wrap = document.querySelector('#modal-svg-stage .diagram-svg-wrap');
          zoomIn('modal-' + modalActiveId, wrap);
        }
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        if (modalActiveId) {
          const wrap = document.querySelector('#modal-svg-stage .diagram-svg-wrap');
          zoomOut('modal-' + modalActiveId, wrap);
        }
      });
    }

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (modalActiveId) {
          const wrap = document.querySelector('#modal-svg-stage .diagram-svg-wrap');
          zoomReset('modal-' + modalActiveId, wrap);
        }
      });
    }

    if (btnDownloadSvg) {
      btnDownloadSvg.addEventListener('click', () => {
        if (modalActiveId) descargarSvg(modalActiveId);
      });
    }

    if (btnDownloadPng) {
      btnDownloadPng.addEventListener('click', () => {
        if (modalActiveId) descargarPng(modalActiveId);
      });
    }

    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        if (modalActiveId) copiarMermaid(modalActiveId, btnCopy);
      });
    }

    // Cerrar con Escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) {
        cerrarPantallaCompleta();
      }
    });

    // Cerrar al clickear el backdrop
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        cerrarPantallaCompleta();
      }
    });
  }

  // 5. INICIALIZACIÓN GLOBAL
  function initHubDiagramas() {
    const tabCentro = document.getElementById('tab-centro');
    const tabDiagramas = document.getElementById('tab-diagramas');

    if (tabCentro) {
      tabCentro.addEventListener('click', () => activarTab('centro'));
      tabCentro.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
          if (tabDiagramas) tabDiagramas.focus();
        }
      });
    }

    if (tabDiagramas) {
      tabDiagramas.addEventListener('click', () => activarTab('diagramas'));
      tabDiagramas.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
          if (tabCentro) tabCentro.focus();
        }
      });
    }

    // Interceptar links que apunten a #diagramas o a un diagrama específico
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';

      if (href === '#diagramas') {
        e.preventDefault();
        activarTab('diagramas');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (href.startsWith('#diagrama-') || href.startsWith('#card-dfd') || href.startsWith('#card-der') || href.startsWith('#card-clases') || href.startsWith('#card-dcu')) {
        e.preventDefault();
        activarTab('diagramas', false);
        const targetId = href.replace('#diagrama-', '#card-').replace('#', '');
        setTimeout(() => {
          const targetEl = document.getElementById(targetId) || document.getElementById(href.substring(1));
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    });

    initModalControls();

    // Comprobar Hash inicial
    if (window.location.hash === '#diagramas' || window.location.hash.startsWith('#diagrama-')) {
      activarTab('diagramas', false);
    } else {
      activarTab('centro', false);
    }

    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#diagramas' || window.location.hash.startsWith('#diagrama-')) {
        activarTab('diagramas', false);
      } else if (window.location.hash === '#centro') {
        activarTab('centro', false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHubDiagramas);
  } else {
    initHubDiagramas();
  }

  // Exportar al ámbito global para tests o extensiones
  window.HubDiagramas = {
    DIAGRAMAS,
    activarTab,
    renderizarDiagramas,
    zoomIn,
    zoomOut,
    zoomReset,
    copiarMermaid,
    descargarSvg,
    descargarPng,
    alternarCodigo,
    abrirPantallaCompleta,
    cerrarPantallaCompleta
  };
})();
