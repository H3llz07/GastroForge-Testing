import React from 'react';
import {
  Printer,
  Users,
  Table2,
  PauseCircle,
  DoorOpen,
  Server,
  Calendar,
  AlertOctagon,
  BookOpen,
  FileCheck,
  Award,
} from 'lucide-react';
import type { QaMetadata } from '../domain/qa-types';

interface GovernanceViewProps {
  metadata: QaMetadata;
}

export const GovernanceView: React.FC<GovernanceViewProps> = ({ metadata }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Cabecera de Gobernanza */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              Gobernanza QA, Matriz RACI, Cronograma y Sustentación
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Estructura organizacional del equipo QA (Bloque A y Bloque B), criterios formales de entrada/salida/suspensión, ambientes reproducibles y firmas de aprobación sobre <code className="font-mono">{metadata.frozenCommit}</code>.
            </p>
          </div>

          <div className="no-print shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir / Exportar PDF
            </button>
          </div>
        </div>
      </section>

      {/* Equipo QA & Responsabilidades (§4 / §10.1) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 print-break-inside-avoid">
        <h3 className="font-display text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
          <Users className="w-4 h-4 text-orange-700" />
          Equipo de Aseguramiento de Calidad y Recursos Humanos (§4 / §10.1)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-medium">
                <th className="py-2.5 px-3">Rol</th>
                <th className="py-2.5 px-3">Nombre y Usuario GitHub</th>
                <th className="py-2.5 px-3">Bloque Asignado</th>
                <th className="py-2.5 px-3">Responsabilidades</th>
                <th className="py-2.5 px-3 text-center">Participación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {metadata.team.map((member, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {member.role}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="font-mono text-[11px] text-orange-800">
                      {member.handle}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-700">
                    {member.block}
                  </td>
                  <td className="py-3 px-3 text-slate-700 leading-relaxed max-w-md">
                    {member.responsibilities}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-slate-900">
                    {member.participation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Matriz RACI (§4.1) */}
      <section className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Table2 className="w-4 h-4 text-orange-700" />
            Matriz de Asignación de Responsabilidades RACI (§4.1)
          </h3>
          <span className="text-xs font-mono text-slate-600">
            R = Responsable | A = Aprobador | C = Consultado | I = Informado
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
                <th className="py-2.5 px-3">Actividad del Ciclo de Pruebas</th>
                <th className="py-2.5 px-3 text-center">QA Lead</th>
                <th className="py-2.5 px-3 text-center">QA Analyst</th>
                <th className="py-2.5 px-3 text-center">Dev</th>
                <th className="py-2.5 px-3 text-center">PO</th>
                <th className="py-2.5 px-3 text-center">Cliente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {metadata.raciMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-900">
                    {row.activity}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900">
                    {row.qaLead}
                  </td>
                  <td className="py-2.5 px-3 text-center font-semibold text-slate-800">
                    {row.qaAnalyst}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700">
                    {row.dev}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700">
                    {row.po}
                  </td>
                  <td className="py-2.5 px-3 text-center text-slate-700">
                    {row.client}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Criterios de Entrada/Salida (§6) y Criterios de Suspensión/Reanudación (§5.4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Criterios de Entrada y Salida (§6) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid space-y-5">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
            <DoorOpen className="w-4 h-4 text-orange-700" />
            Criterios de Entrada y Salida (§6)
          </h3>

          <div>
            <h4 className="font-mono text-xs font-bold text-slate-800 uppercase mb-2">
              6.1 Criterios de Entrada (Cumplidos 4/4)
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {metadata.entryExitCriteria.entry.map((item, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded bg-slate-50 border border-slate-200 leading-relaxed"
                >
                  <span className="font-mono font-bold text-emerald-700 mr-1.5">
                    [OK]
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs font-bold text-slate-800 uppercase mb-2">
              6.2 Criterios de Salida (Cumplidos 4/4)
            </h4>
            <ul className="space-y-2 text-xs text-slate-700">
              {metadata.entryExitCriteria.exit.map((item, idx) => (
                <li
                  key={idx}
                  className="p-2.5 rounded bg-emerald-50/50 border border-emerald-200 leading-relaxed"
                >
                  <span className="font-mono font-bold text-emerald-700 mr-1.5">
                    [OK]
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Criterios de Suspensión y Reanudación (§5.4) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <PauseCircle className="w-4 h-4 text-orange-700" />
            Criterios de Suspensión y Reanudación (§5.4)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Condición de Suspensión</th>
                  <th className="py-2.5 px-3">Condición Formal de Reanudación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {metadata.suspensionCriteria.map((pair, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      0{idx + 1}
                    </td>
                    <td className="py-3 px-3 text-slate-800 leading-relaxed">
                      {pair.suspensionCriterion}
                    </td>
                    <td className="py-3 px-3 text-slate-700 leading-relaxed">
                      {pair.resumptionRequirement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Ambientes de Prueba (§10.3) y Entregables (§9) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ambientes de Prueba (§10.3) */}
        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <Server className="w-4 h-4 text-orange-700" />
            Ambientes de Prueba (§10.3)
          </h3>

          <div className="space-y-3">
            {metadata.environments.map((env, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded bg-slate-50 border border-slate-200 text-xs space-y-1"
              >
                <div className="font-bold text-slate-900">{env.name}</div>
                <div className="font-mono text-[11px] text-orange-800 break-all">
                  {env.urlOrServer}
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Versión: {env.version}
                </div>
                <div className="text-[11px] text-slate-600">
                  Responsable: {env.responsible}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Entregables de Prueba (§9) */}
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <FileCheck className="w-4 h-4 text-orange-700" />
            Catálogo de Entregables Verificables (§9)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
                  <th className="py-2 px-3">Entregable</th>
                  <th className="py-2 px-3">Fase</th>
                  <th className="py-2 px-3">Artefacto en Repositorio</th>
                  <th className="py-2 px-3">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {metadata.deliverables.map((deliv, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{deliv.name}</div>
                      <div className="text-[11px] text-slate-600">
                        {deliv.description}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700">
                      {deliv.phase}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-orange-800 font-semibold">
                      {deliv.artifactPath}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                      {deliv.estimatedDate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Cronograma de Ejecución (§11) y Matriz de Riesgos (§12) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cronograma (§11) */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <Calendar className="w-4 h-4 text-orange-700" />
            Cronograma de Actividades QA (§11)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-100 text-slate-700 font-mono uppercase">
                  <th className="py-2 px-2.5">Actividad</th>
                  <th className="py-2 px-2.5">Inicio / Fin</th>
                  <th className="py-2 px-2.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {metadata.schedule.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2.5">
                      <div className="font-medium text-slate-900">{item.activity}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.responsible}
                      </div>
                    </td>
                    <td className="py-2.5 px-2.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">
                      {item.startDate} → {item.endDate}
                    </td>
                    <td className="py-2.5 px-2.5 text-center font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Riesgos y Mitigación (§12) */}
        <section className="lg:col-span-6 bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
            <AlertOctagon className="w-4 h-4 text-orange-700" />
            Riesgos y Planes de Mitigación (§12)
          </h3>

          <div className="space-y-3">
            {metadata.risks.map((risk) => (
              <div
                key={risk.id}
                className="p-3 rounded border border-slate-200 bg-slate-50/70 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-mono font-bold text-slate-900">
                    Riesgo #{risk.id}
                  </span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-700">
                      Probabilidad: {risk.probability}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-semibold">
                      Impacto: {risk.impact}
                    </span>
                  </div>
                </div>
                <p className="font-semibold text-slate-900 leading-snug">
                  {risk.risk}
                </p>
                <p className="mt-1 text-slate-700 leading-relaxed">
                  <strong className="font-mono text-[11px] text-orange-800">
                    Mitigación:
                  </strong>{' '}
                  {risk.mitigationPlan}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Glosario y Siglas (§14) + Aprobaciones (§15) */}
      <section className="bg-white border border-slate-200 rounded-md p-6 print-break-inside-avoid">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <BookOpen className="w-4 h-4 text-orange-700" />
          Glosario Técnico y Siglas (§14.1 / §14.2)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {metadata.acronyms.map((ac) => (
            <div
              key={ac.acronym}
              className="p-2.5 rounded border border-slate-200 bg-slate-50"
            >
              <div className="font-mono font-bold text-slate-900">
                {ac.acronym} — <span className="font-normal text-slate-600">{ac.meaning}</span>
              </div>
              <div className="text-slate-700 mt-1 text-[11px] leading-snug">
                {ac.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Firmas y Aprobación Formal (§15) */}
      <section className="bg-slate-900 text-white rounded-md p-6 print-break-inside-avoid">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
          <h3 className="text-base font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-orange-400" />
            Aprobación Formal del Plan y Ciclo de Pruebas (§15)
          </h3>
          <span className="font-mono text-xs text-emerald-400 font-semibold">
            Fecha de Aprobación: {metadata.date}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="p-4 rounded bg-slate-800 border border-slate-700">
            <div className="text-orange-400 font-bold">QA Lead — Bloque A</div>
            <div className="text-sm font-sans font-bold text-white mt-1">
              Jhonatan A. Méndez R. (@JhonatanM2005)
            </div>
            <div className="text-slate-300 mt-1 text-[11px]">
              Auth, Catálogo, Mesas, Órdenes y Cocina (CP-001 a CP-023)
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-emerald-400 font-semibold">
              Firma Digital Verificada — {metadata.date}
            </div>
          </div>

          <div className="p-4 rounded bg-slate-800 border border-slate-700">
            <div className="text-orange-400 font-bold">QA Lead — Bloque B</div>
            <div className="text-sm font-sans font-bold text-white mt-1">
              Julián Santiago Pico Pinzón (@H3llz07)
            </div>
            <div className="text-slate-300 mt-1 text-[11px]">
              Caja, Pagos, Inventario, Reportes y Suite RLS (CP-024 a CP-040)
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-emerald-400 font-semibold">
              Firma Digital Verificada — {metadata.date}
            </div>
          </div>

          <div className="p-4 rounded bg-slate-800 border border-slate-700">
            <div className="text-orange-400 font-bold">Comité Evaluador / PO Académico</div>
            <div className="text-sm font-sans font-bold text-white mt-1">
              {metadata.institution}
            </div>
            <div className="text-slate-300 mt-1 text-[11px]">
              Auditoría de Trazabilidad, Plan de Pruebas e Informe APA 7
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-emerald-400 font-semibold">
              Estado: {metadata.status}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
