"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Users,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  BookOpen,
  Award,
  Briefcase,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Linkedin,
  Twitter,
  Instagram,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Add this import at the top of the file
import FirebaseDebugger from "@/components/FirebaseDebugger"

// Typewriter Animation Component
function TypewriterText() {
  const phrases = ["Land Your Dream Job", "Ace Every Interview", "Build Confidence", "Unlock Your Potential"]

  const [currentPhrase, setCurrentPhrase] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        const fullText = phrases[currentPhrase]

        if (isDeleting) {
          setCurrentText(fullText.substring(0, currentText.length - 1))
        } else {
          setCurrentText(fullText.substring(0, currentText.length + 1))
        }

        if (!isDeleting && currentText === fullText) {
          setTimeout(() => setIsDeleting(true), 2000)
        } else if (isDeleting && currentText === "") {
          setIsDeleting(false)
          setCurrentPhrase((prev) => (prev + 1) % phrases.length)
        }
      },
      isDeleting ? 50 : 100,
    )

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, currentPhrase, phrases])

  return (
    <span className="text-blue-600">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

// Animated Section Component
function AnimatedSection({ children, className = "", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-20 scale-95"
      } ${className}`}
    >
      {children}
    </div>
  )
}

// Animated Card Component
function AnimatedCard({ children, className = "", delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
        }
      },
      {
        threshold: 0.2,
      },
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [delay])

  return (
    <div
      ref={ref}
      className={`transition-all duration-1200 ease-out ${
        isVisible ? "opacity-100 translate-y-0 scale-100 rotate-0" : "opacity-0 translate-y-16 scale-90 rotate-2"
      } ${className}`}
    >
      {children}
    </div>
  )
}

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">recruto.ai</span>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="#services" className="text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </Link>
              <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link href="#team" className="text-gray-600 hover:text-blue-600 transition-colors">
                Team
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
                Pricing
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-blue-600">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">🚀 Your Career Success Partner</Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Prepare. Practice. <br />
                  <TypewriterText />
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your interview skills with AI-powered coaching, personalized feedback, and expert guidance.
                  Join thousands who've landed their dream jobs with recruto.ai.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">95%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Partner Companies</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Image
                  src="/placeholder.svg?height=600&width=500"
                  alt="Interview Preparation Platform"
                  width={500}
                  height={600}
                  className="rounded-2xl shadow-2xl"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Our Services</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Everything You Need to Succeed</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive interview preparation tools and personalized coaching to help you land your dream job
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: "AI Mock Interviews",
                description: "Practice with our AI interviewer that adapts to your industry and role",
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Personalized Feedback",
                description: "Get detailed analysis of your performance with actionable improvement tips",
              },
              {
                icon: <Award className="w-8 h-8" />,
                title: "Industry Experts",
                description: "Learn from professionals who've worked at top companies",
              },
              {
                icon: <Briefcase className="w-8 h-8" />,
                title: "Company-Specific Prep",
                description: "Tailored preparation for your target companies and roles",
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Progress Tracking",
                description: "Monitor your improvement with detailed analytics and insights",
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Peer Community",
                description: "Connect with other job seekers and share experiences",
              },
            ].map((service, index) => (
              <AnimatedCard key={index} delay={index * 200}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 h-full">
                  <CardHeader>
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl text-gray-900">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* USPs Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <Badge className="bg-blue-100 text-blue-800 mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Your Success is Our Mission</h2>
              <div className="space-y-6">
                {[
                  "AI-powered personalized coaching",
                  "Real-time feedback and improvement tracking",
                  "Industry-specific interview preparation",
                  "24/7 access to practice sessions",
                  "Expert mentorship from top professionals",
                  "Proven track record with 95% success rate",
                ].map((usp, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                    <span className="text-gray-700 text-lg">{usp}</span>
                  </div>
                ))}
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="Success Metrics"
                width={600}
                height={500}
                className="rounded-2xl shadow-xl"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Our Team</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Meet the Experts Behind Your Success</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our team consists of industry veterans, HR professionals, and career coaches from top companies
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Sarah Johnson", role: "CEO & Career Coach", company: "Ex-Google" },
              { name: "Michael Chen", role: "AI Engineering Lead", company: "Ex-Microsoft" },
              { name: "Emily Rodriguez", role: "HR Director", company: "Ex-Amazon" },
              { name: "David Kim", role: "Interview Expert", company: "Ex-Meta" },
            ].map((member, index) => (
              <AnimatedCard key={index} delay={index * 150}>
                <Card className="text-center border-0 shadow-lg h-full">
                  <CardHeader>
                    <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
                    <CardTitle className="text-lg text-gray-900">{member.name}</CardTitle>
                    <CardDescription className="text-blue-600 font-medium">{member.role}</CardDescription>
                    <Badge variant="secondary" className="mt-2">
                      {member.company}
                    </Badge>
                  </CardHeader>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 lg:px-6">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Success Stories</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Real Results from Real People</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Alex Thompson",
                role: "Software Engineer at Google",
                content:
                  "recruto.ai helped me land my dream job at Google. The AI mock interviews were incredibly realistic!",
                rating: 5,
              },
              {
                name: "Priya Patel",
                role: "Product Manager at Microsoft",
                content:
                  "The personalized feedback was game-changing. I went from nervous to confident in just 2 weeks.",
                rating: 5,
              },
              {
                name: "James Wilson",
                role: "Data Scientist at Amazon",
                content: "The company-specific preparation made all the difference. I knew exactly what to expect.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <AnimatedCard key={index} delay={index * 200}>
                <Card className="border-0 shadow-lg h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-gray-700 text-base leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6">
          <AnimatedSection className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Pricing Plans</Badge>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Choose Your Success Plan</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Flexible pricing options to fit your needs and budget
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$29",
                period: "/month",
                features: ["5 AI mock interviews", "Basic feedback reports", "Email support", "Access to community"],
                popular: false,
              },
              {
                name: "Professional",
                price: "$79",
                period: "/month",
                features: [
                  "Unlimited AI mock interviews",
                  "Detailed feedback & analytics",
                  "1-on-1 expert coaching",
                  "Company-specific preparation",
                  "Priority support",
                  "Resume review",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "$199",
                period: "/month",
                features: [
                  "Everything in Professional",
                  "Dedicated career coach",
                  "Custom interview scenarios",
                  "Salary negotiation coaching",
                  "LinkedIn profile optimization",
                  "Job search strategy",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <AnimatedCard key={index} delay={index * 200}>
                <Card
                  className={`relative h-full ${plan.popular ? "border-blue-500 shadow-xl scale-105" : "border-gray-200"}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-gray-900">{plan.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600">{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                    <Button
                      className={`w-full mt-6 ${plan.popular ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-900"}`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <AnimatedSection>
              <Badge className="bg-blue-100 text-blue-800 mb-4">Get in Touch</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6">Ready to Start Your Journey?</h2>
              <p className="text-xl text-gray-600 mb-8">
                Have questions? We're here to help you succeed. Reach out to our team for personalized guidance.
              </p>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Email Us</div>
                    <div className="text-gray-600">hello@recruto.ai</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Call Us</div>
                    <div className="text-gray-600">+1 (555) 123-4567</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Visit Us</div>
                    <div className="text-gray-600">San Francisco, CA</div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={300}>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl text-gray-900">Send us a message</CardTitle>
                  <CardDescription>We'll get back to you within 24 hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">First Name</label>
                      <Input placeholder="John" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Last Name</label>
                      <Input placeholder="Doe" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Subject</label>
                    <Input placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Message</label>
                    <Textarea placeholder="Tell us more about your needs..." rows={4} />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Message</Button>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">recruto.ai</span>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering job seekers with AI-powered interview preparation and career coaching.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Twitter className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Instagram className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-6">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} recruto.ai. All rights reserved.</p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">Made with ❤️ for job seekers worldwide</p>
          </div>
        </div>
      </footer>
      <FirebaseDebugger />
    </div>
  )
}
