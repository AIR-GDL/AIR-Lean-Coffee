export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex-shrink-0 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-600">
          AIR Lean Coffee - Improving {currentYear}
        </p>
      </div>
    </footer>
  );
}
