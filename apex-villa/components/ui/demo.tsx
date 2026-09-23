"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { TrendingUp, Calendar, ShieldCheck, ArrowUpRight } from "lucide-react";

export function HeroScrollDemo() {
  const cases = [
    {
      id: "Apex-Finanças",
      stat: "+420%",
      statLabel: "Aumento em Cobranças Ativas",
      category: "Finanças & SaaS",
      description: "Plataforma de alta precisão para controle de financiamentos, automação de cobranças com régua inteligente, cálculo automatizado de juros compostos e gestão completa de carteira.",
      icon: TrendingUp,
      tech: ["React", "Node.js", "PostgreSQL", "AI Engine"],
    },
    {
      id: "Apex-Estética",
      stat: "24/7",
      statLabel: "Agendamento Automático",
      category: "Saúde & Estética",
      description: "Solução completa de CRM e operação para clínicas médicas e estéticas. Inclui agendamentos assistidos por inteligência artificial, prontuários digitais e controle de tratamentos.",
      icon: Calendar,
      tech: ["Next.js", "Tailwind CSS", "Supabase", "AI Bot"],
    },
    {
      id: "Apex-Glass",
      stat: "100%",
      statLabel: "Controle de Fluxo Digital",
      category: "Gestão Automotiva",
      description: "Especialista para vidraçarias automotivas e oficinas de alto volume. Automatiza o fluxo de orçamentos, controle dinâmico de estoque de peças raras e faturamento integrado.",
      icon: ShieldCheck,
      tech: ["React Native", "FastAPI", "MongoDB", "Cloud Services"],
    },
  ];

  return (
    <div className="flex flex-col overflow-hidden bg-[#0A1F1C] py-20">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold tracking-widest text-[#D4AF37] uppercase mb-4">
              Cases de Sucesso & Sistemas Entregues
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-none">
              O Que Entregamos para Nossos Clientes: <br />
              <span className="text-4xl md:text-[5.5rem] text-[#D4AF37] font-extrabold mt-2 block">
                Resultados Reais & Medíveis
              </span>
            </h1>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full p-4 md:p-8 bg-[#0F2E2A] text-white">
          {cases.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#122C28] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-lg hover:shadow-[#D4AF37]/5"
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
                      {project.category}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-[#0A1F1C] transition-all duration-300">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
                    {project.id}
                  </h3>

                  {/* Stat Badge */}
                  <div className="my-4 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-[#D4AF37] tracking-tight">
                      {project.stat}
                    </span>
                    <span className="text-xs text-[#A3B8B2] font-medium">
                      {project.statLabel}
                    </span>
                  </div>

                  <p className="text-sm text-[#A3B8B2] leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                <div className="relative z-10 mt-auto">
                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((t) => (
                      <span key={t} className="text-[10px] font-mono bg-white/5 px-2 py-1 rounded-md text-[#A3B8B2]">
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#D4AF37] uppercase group-hover:text-white transition-colors duration-300">
                    <span>Ver Estudo de Caso</span>
                    <ArrowUpRight className="h-4 w-4 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                  </div>
                </div>

                {/* Subtle light leak gradient background on hover */}
                <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#D4AF37]/0 via-[#D4AF37]/0 to-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </ContainerScroll>
    </div>
  );
}
