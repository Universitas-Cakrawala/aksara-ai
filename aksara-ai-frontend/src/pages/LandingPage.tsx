import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React from 'react';
import { Link } from 'react-router-dom';
import logoAksara from '@/assets/logo_Aksara.png';

const LandingPage: React.FC = () => {
    const features = [
        {
            title: 'AI Chat Cerdas',
            description: 'Diskusi mendalam tentang literasi dengan AI yang memahami konteks akademik',
            icon: '🤖',
        },
        {
            title: 'Ruang Aksara',
            description: 'Tempat bertemu ide, diskusi, dan karya. Semua bisa jadi bagian dari cerita literasi kampus.',
            icon: '🎓',
        },
        {
            title: 'Aksara Nusantara',
            description: 'Melestarikan dan mengembangkan literasi berbasis budaya lokal Indonesia',
            icon: '📜',
        },
    ];

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50">
            {/* Background Logo - Subtle Watermark */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div
                    className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.15] blur-sm"
                    style={{
                        backgroundImage: `url(${logoAksara})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                    }}
                />
            </div>

            {/* Content Wrapper - Above Background */}
            <div className="relative z-10">
                {/* Navbar */}
                <Navbar variant="landing" />

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-4xl">
                    <h1 className="mb-6 text-5xl font-bold md:text-6xl">
                        <span className="bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                            Aksara AI
                        </span>
                    </h1>
                    <p className="mb-8 text-xl leading-relaxed text-muted-foreground md:text-2xl">
                        Platform AI untuk Komunitas Literasi Kampus
                    </p>
                    <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
                        Bergabunglah dengan komunitas literasi modern yang menggabungkan kearifan lokal dengan teknologi
                        AI untuk mengembangkan budaya baca-tulis di lingkungan kampus.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            <section className="container mx-auto px-4 py-20">
                <div className="mx-auto max-w-6xl">
                    <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">Fitur Unggulan</h2>
                    <p className="mx-auto mb-16 max-w-2xl text-center text-lg text-muted-foreground">
                        Teknologi AI terdepan untuk mendukung perjalanan literasi Anda
                    </p>

                    <div className="grid gap-8 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className="text-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
                            >
                                <CardHeader>
                                    <div className="mb-4 text-4xl">{feature.icon}</div>
                                    <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-base">{feature.description}</CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="bg-gradient-to-r from-amber-50 to-yellow-50 py-20">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl">
                        <div className="grid items-center gap-12 md:grid-cols-2">
                            <div>
                                <h2 className="mb-6 text-3xl font-bold md:text-4xl">Tentang Aksara AI</h2>
                                <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
                                    Ruang tumbuh dan kolaborasi antar mahasiswa dalam mengasah kemampuan literasi multidimensi serta memperkuat budaya akademik yang kritis dan produktif.
                                </p>
                                <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                                    Dengan Aksara AI, setiap ide dapat diolah menjadi karya tulis, puisi, atau artikel yang inspiratif dan berkualitas.
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
                                            Misi UKM Aksara Cakrawala
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            1. Menumbuhkan minat baca dan menulis di kalangan mahasiswa.
                                            2. Mendorong mahasiswa menghasilkan karya tulis kreatif maupun ilmiah.
                                            3. Menyediakan ruang publikasi dan media ekspresi literasi.
                                            4. Menyelenggarakan kegiatan literasi yang edukatif dan kolaboratif.
                                            5. Berkontribusi dalam pengabdian masyarakat melalui gerakan literasi.
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-3">
                                            <span className="text-2xl">✨</span>
                                            Visi UKM Aksara Cakrawala
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            Menjadi wadah pengembangan literasi, kepenulisan, dan publikasi ilmiah maupun kreatif bagi mahasiswa, 
                                            untuk menciptakan generasi intelektual yang kritis, inspiratif, dan berdaya saling global.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <div className="mx-auto max-w-3xl">
                    <h2 className="mb-6 text-3xl font-bold md:text-4xl">Siap Memulai Perjalanan Literasi?</h2>
                    <p className="mb-8 text-xl text-muted-foreground">
                        Bergabunglah dengan ribuan mahasiswa yang telah merasakan pengalaman literasi yang transformatif
                        bersama Aksara AI.
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
        </div>
    );
};

export default LandingPage;
