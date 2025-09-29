import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const LandingPage: React.FC = () => {
  const features = [
    {
      title: "AI Chat Cerdas",
      description: "Diskusi mendalam tentang literasi dengan AI yang memahami konteks akademik",
      icon: "🤖"
    },
    {
      title: "Komunitas Kampus",
      description: "Bergabung dengan komunitas literasi kampus yang aktif dan inspiratif",
      icon: "🎓"
    },
    {
      title: "Aksara Nusantara",
      description: "Melestarikan dan mengembangkan literasi berbasis budaya lokal Indonesia",
      icon: "📜"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
      {/* Navbar */}
      <Navbar variant="landing" />

      {/* Hero Section */}
      <section className="container px-4 py-20 mx-auto text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Aksara AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Platform AI untuk Komunitas Literasi Kampus
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Bergabunglah dengan komunitas literasi modern yang menggabungkan kearifan lokal 
            dengan teknologi AI untuk mengembangkan budaya baca-tulis di lingkungan kampus.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="px-8 py-6 text-lg">
                Mulai Sekarang
              </Button>
            </Link>
            <a href="#about">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                Pelajari Lebih Lanjut
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20 mx-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Fitur Unggulan
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Teknologi AI terdepan untuk mendukung perjalanan literasi Anda
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="bg-gradient-to-r from-amber-50 to-yellow-50 py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Tentang Aksara AI
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Aksara AI adalah platform inovatif yang menggabungkan kecerdasan buatan 
                  dengan semangat literasi nusantara. Kami percaya bahwa teknologi dapat 
                  menjadi jembatan untuk melestarikan dan mengembangkan budaya literasi 
                  di lingkungan kampus.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Dengan AI yang memahami konteks budaya Indonesia, kami membantu mahasiswa 
                  dan akademisi mengeksplorasi dunia literasi dengan cara yang lebih personal 
                  dan bermakna.
                </p>
                <Link to="/register">
                  <Button size="lg" className="px-8">
                    Bergabung Sekarang
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">🎯</span>
                      Misi Kami
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Membangun ekosistem literasi digital yang berlandaskan nilai-nilai 
                      budaya Indonesia untuk generasi akademik masa depan.
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <span className="text-2xl">✨</span>
                      Visi Kami
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Menjadi platform literasi AI terdepan yang melestarikan kearifan 
                      lokal sambil mengadopsi teknologi global.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-20 mx-auto text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Siap Memulai Perjalanan Literasi?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Bergabunglah dengan ribuan mahasiswa yang telah merasakan pengalaman 
            literasi yang transformatif bersama Aksara AI.
          </p>
          <Link to="/register">
            <Button size="lg" className="px-12 py-6 text-lg">
              Daftar Gratis Sekarang
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;