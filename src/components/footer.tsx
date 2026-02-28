import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Security Checklist", href: "/security-checklist" },
    { label: "Start Free Trial", href: "/signup" },
  ],
  Resources: [
    { label: "Vibe Coding Risks", href: "/vibe-coding-risks" },
    { label: "Compliance Monitoring", href: "/compliance" },
    { label: "Documentation", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Careers", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <span className="text-sm font-bold text-white">V</span>
              </div>
              <span className="font-bold">VibeSafe</span>
            </div>
            <p className="mt-4 text-sm text-gray-500 leading-relaxed">
              Continuous security monitoring for AI-generated applications. No SDK required.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-900">{category}</h4>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-xs text-gray-400">© 2026 VibeSafe. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">Twitter</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">LinkedIn</Link>
            <Link href="#" className="text-xs text-gray-400 hover:text-gray-600">GitHub</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
