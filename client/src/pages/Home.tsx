// Página de inicio/landing para la plataforma Neurolex
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Vote, TrendingUp, Coins, Award, Shield, MessageSquare, BarChart3 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import evotingBannerUrl from "@assets/Evoting banner_1761708286562.png";

export default function Home() {
  const features = [
    {
      icon: Vote,
      titulo: "Votación Transparente",
      descripcion: "Sistema de e-voting seguro y transparente con verificación en blockchain",
    },
    {
      icon: TrendingUp,
      titulo: "Participación Incentivada",
      descripcion: "Gana tokens por participar activamente en la plataforma",
    },
    {
      icon: MessageSquare,
      titulo: "Deliberación Informada",
      descripcion: "Debate y discute propuestas con otros ciudadanos",
    },
    {
      icon: Shield,
      titulo: "Gobernanza Comunitaria",
      descripcion: "Participa en decisiones que afectan a tu comunidad",
    },
  ];

  const tokenTypes = [
    {
      tipo: "TP",
      nombre: "Tokens de Participación",
      descripcion: "Obtén TP al votar, comentar y participar activamente. Úsalos para apoyar propuestas y acceder a contenido premium.",
      icon: TrendingUp,
      color: "from-blue-500 to-blue-700",
    },
    {
      tipo: "TA",
      nombre: "Tokens de Apoyo",
      descripcion: "Compra TA para financiar propuestas ciudadanas y partidos políticos. Total transparencia en las donaciones.",
      icon: Coins,
      color: "from-green-500 to-green-700",
    },
    {
      tipo: "TGR",
      nombre: "Tokens de Gobernanza",
      descripcion: "Otorgados a roles clave de la plataforma. Participan en decisiones sobre la evolución de Neurolex.",
      icon: Award,
      color: "from-purple-500 to-purple-700",
    },
  ];

  const steps = [
    { numero: 1, titulo: "Regístrate", descripcion: "Crea tu cuenta gratuita en menos de 1 minuto" },
    { numero: 2, titulo: "Explora", descripcion: "Descubre propuestas, noticias y sondeos activos" },
    { numero: 3, titulo: "Participa", descripcion: "Vota, comenta y crea propuestas ciudadanas" },
    { numero: 4, titulo: "Gana Tokens", descripcion: "Acumula TP por tu participación activa" },
    { numero: 5, titulo: "Influye", descripcion: "Usa tus tokens para apoyar causas que te importan" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/20 via-background to-background">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background z-10" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 text-center">
          <Badge className="mb-6" data-testid="badge-hero-tag">
            Plataforma de Democracia Digital
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-[Poppins] mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Tu Voz, Tu Futuro
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Neurolex es la plataforma de gobernanza y participación cívica que empodera a los ciudadanos 
            para tomar decisiones informadas y transparentes sobre su futuro.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/registro">
              <Button size="lg" className="text-lg px-8" data-testid="button-hero-register">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/informacion">
              <Button size="lg" variant="outline" className="text-lg px-8" data-testid="button-hero-learn">
                Saber Más
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { numero: "10K+", label: "Usuarios Activos" },
              { numero: "500+", label: "Propuestas" },
              { numero: "50K+", label: "Votos Emitidos" },
              { numero: "100%", label: "Transparente" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-3xl md:text-4xl font-bold font-mono text-primary">{stat.numero}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              Tres Pilares de la Democracia Digital
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Participación, Transparencia y Gobernanza al alcance de todos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10 w-fit">
                      <Icon className="h-8 w-8 text-primary" />
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

      {/* Sistema de Tokens */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              Sistema de Tokens
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Incentivamos la participación cívica con un sistema de tokens transparente
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tokenTypes.map((token, index) => {
              const Icon = token.icon;
              return (
                <Card key={index} className="hover-elevate overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${token.color}`} />
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-md bg-gradient-to-br ${token.color}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <Badge variant="outline" className="font-mono font-bold">
                          {token.tipo}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{token.nombre}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{token.descripcion}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
              Cómo Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comienza tu viaje en la democracia digital en 5 simples pasos
            </p>
          </div>

          <div className="relative">
            {/* Timeline conectora - Desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-primary/20 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
              {steps.map((step) => (
                <div key={step.numero} className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary flex items-center justify-center text-2xl font-bold font-mono text-primary-foreground">
                    {step.numero}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{step.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{step.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner E-voting */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
                  Votación Electrónica Segura
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Nuestro sistema de e-voting utiliza tecnología blockchain para garantizar 
                  la transparencia, seguridad e inmutabilidad de cada voto.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Verificación de identidad multinivel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Resultados en tiempo real</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Auditoría pública transparente</span>
                  </li>
                </ul>
                <Link href="/registro">
                  <Button size="lg" data-testid="button-evoting-cta">
                    Participar Ahora
                  </Button>
                </Link>
              </div>
              <div className="bg-muted flex items-center justify-center p-8">
                <img 
                  src={evotingBannerUrl} 
                  alt="E-voting Neurolex" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-[Poppins] mb-4">
            Haz que tu voz cuente
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Únete a miles de ciudadanos que ya están participando activamente en la construcción 
            de una democracia más transparente y participativa.
          </p>
          <Link href="/registro">
            <Button size="lg" className="text-lg px-8" data-testid="button-final-cta">
              Crear Cuenta Gratuita
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
