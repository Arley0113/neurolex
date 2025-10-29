// Página de información sobre Neurolex
import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Shield, Users, TrendingUp, Coins, Award, Vote, MessageSquare, BarChart3, CheckCircle } from "lucide-react";

export default function Informacion() {
  const caracteristicas = [
    {
      icon: Vote,
      titulo: "E-voting Seguro",
      descripcion: "Sistema de votación electrónica con tecnología blockchain para garantizar transparencia e inmutabilidad.",
    },
    {
      icon: Coins,
      titulo: "Sistema de Tokens",
      descripcion: "Tres tipos de tokens (TP, TA, TGR) para incentivar la participación y permitir contribuciones económicas transparentes.",
    },
    {
      icon: TrendingUp,
      titulo: "Gamificación con Karma",
      descripcion: "Sistema de puntos que recompensa la participación de calidad y desbloquea privilegios en la plataforma.",
    },
    {
      icon: MessageSquare,
      titulo: "Deliberación Ciudadana",
      descripcion: "Espacios de debate estructurado para propuestas de ley y políticas públicas.",
    },
    {
      icon: Shield,
      titulo: "Verificación de Identidad",
      descripcion: "Sistema progresivo de verificación para garantizar la legitimidad de los usuarios.",
    },
    {
      icon: BarChart3,
      titulo: "Transparencia Total",
      descripcion: "Todas las transacciones, votos y decisiones son públicas y auditables.",
    },
  ];

  const faq = [
    {
      pregunta: "¿Qué es Neurolex?",
      respuesta: "Neurolex es una plataforma de democracia digital que facilita la participación cívica, el e-voting y la gobernanza comunitaria. Nuestro objetivo es crear un ecosistema transparente donde los ciudadanos puedan influir directamente en las decisiones que afectan su comunidad.",
    },
    {
      pregunta: "¿Cómo funcionan los tokens?",
      respuesta: "Tenemos tres tipos de tokens: Tokens de Participación (TP) que ganas al participar activamente, Tokens de Apoyo (TA) que puedes comprar para financiar propuestas o partidos, y Tokens de Gobernanza (TGR) otorgados a roles clave para votar en la evolución de la plataforma.",
    },
    {
      pregunta: "¿Es seguro votar en línea?",
      respuesta: "Sí. Utilizamos tecnología blockchain para garantizar que cada voto sea inmutable, verificable y anónimo. El sistema incluye verificación de identidad multinivel y auditorías públicas transparentes.",
    },
    {
      pregunta: "¿Cómo gano Karma?",
      respuesta: "Ganas Karma al votar en elecciones, escribir comentarios valorados positivamente, crear propuestas aceptadas, participar en sondeos y completar misiones cívicas. El Karma desbloquea privilegios como proponer leyes o participar en debates de alto nivel.",
    },
    {
      pregunta: "¿Puedo proponer leyes?",
      respuesta: "Sí, los usuarios verificados con suficiente Karma pueden crear propuestas ciudadanas. Estas pasan por fases de apoyo, deliberación y votación. Si alcanzan los umbrales necesarios, pueden convertirse en consultas oficiales.",
    },
    {
      pregunta: "¿Cómo se protege mi privacidad?",
      respuesta: "Tus datos personales están encriptados y nunca se comparten con terceros. Los votos son anónimos y solo tú puedes ver tu historial completo de actividad. Cumplimos con todas las regulaciones de protección de datos.",
    },
  ];

  const comoEmpezar = [
    {
      numero: 1,
      titulo: "Regístrate",
      descripcion: "Crea tu cuenta gratuita con tu email. Solo toma un minuto.",
    },
    {
      numero: 2,
      titulo: "Verifica tu Identidad (Opcional)",
      descripcion: "Para votar y proponer leyes, verifica tu identidad. Esto garantiza la legitimidad del sistema.",
    },
    {
      numero: 3,
      titulo: "Explora y Participa",
      descripcion: "Lee noticias, vota en sondeos, comenta propuestas y gana tus primeros Tokens de Participación.",
    },
    {
      numero: 4,
      titulo: "Crea Propuestas",
      descripcion: "Cuando acumules suficiente Karma, podrás crear tus propias propuestas ciudadanas.",
    },
    {
      numero: 5,
      titulo: "Influye y Gobierna",
      descripcion: "Usa tus tokens para apoyar causas, vota en decisiones importantes y forma parte del cambio.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-[Poppins] mb-4" data-testid="text-page-title">
              ¿Qué es Neurolex?
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              Somos una plataforma de democracia digital que empodera a los ciudadanos para participar 
              activamente en la toma de decisiones a través de votación electrónica, propuestas ciudadanas 
              y un sistema de incentivos transparente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/registro">
                <Button size="lg" data-testid="button-register">
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="/contacto">
                <Button size="lg" variant="outline" data-testid="button-contact">
                  Contactar
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Características */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] text-center mb-12">
              Características Principales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caracteristicas.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover-elevate">
                    <CardHeader>
                      <div className="mb-4 p-3 rounded-full bg-primary/10 w-fit">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{feature.titulo}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.descripcion}</CardDescription>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Cómo Empezar */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] text-center mb-12">
              Cómo Empezar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {comoEmpezar.map((paso) => (
                <div key={paso.numero} className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold font-mono text-primary-foreground">
                      {paso.numero}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{paso.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{paso.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Preguntas Frecuentes */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] text-center mb-12">
              Preguntas Frecuentes
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faq.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                    {item.pregunta}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                    {item.respuesta}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Valores */}
        <section className="py-20 bg-card">
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] text-center mb-12">
              Nuestros Valores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Transparencia</h3>
                <p className="text-muted-foreground">
                  Todas las decisiones, votos y transacciones son públicas y verificables
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Participación</h3>
                <p className="text-muted-foreground">
                  Incentivamos la participación activa de todos los ciudadanos
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                  <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Descentralización</h3>
                <p className="text-muted-foreground">
                  El poder está distribuido entre la comunidad, no centralizado
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              ¿Listo para participar?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a miles de ciudadanos que ya están construyendo una democracia más transparente
            </p>
            <Link href="/registro">
              <Button size="lg" className="text-lg px-8" data-testid="button-final-cta">
                Crear Cuenta Gratuita
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
