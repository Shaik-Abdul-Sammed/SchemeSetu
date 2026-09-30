import 'package:chit_fund_app/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../main_screen.dart';
import '../../localization/app_localizations.dart';
import 'package:chit_fund_app/widgets/translated_text.dart';

class OnboardingScreen extends StatefulWidget {
  final bool isFromSettings;
  const OnboardingScreen({super.key, this.isFromSettings = false});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  void _next(int pagesCount) {
    if (_currentPage < pagesCount - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      _finish();
    }
  }

  Future<void> _finish() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('seen_onboarding', true);
    if (!mounted) return;
    if (widget.isFromSettings) {
      Navigator.pop(context);
    } else {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const MainScreen(),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    }
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localizations = AppLocalizations.of(context);
    final pages = [
      _OnboardPage(
        icon: Icons.dashboard_rounded,
        title: localizations.translate('onboarding_title_1'),
        subtitle: localizations.translate('onboarding_subtitle_1'),
        gradient: const [AppTheme.primaryTeal, Color(0xFF0D4F47)],
      ),
      _OnboardPage(
        icon: Icons.chat_rounded,
        title: localizations.translate('onboarding_title_2'),
        subtitle: localizations.translate('onboarding_subtitle_2'),
        gradient: const [Color(0xFF7C3AED), Color(0xFF4F46E5)],
      ),
      _OnboardPage(
        icon: Icons.translate_rounded,
        title: localizations.translate('onboarding_title_3'),
        subtitle: localizations.translate('onboarding_subtitle_3'),
        gradient: const [Color(0xFFD97706), Color(0xFFB45309)],
      ),
      _OnboardPage(
        icon: Icons.notifications_active_rounded,
        title: localizations.translate('onboarding_title_4'),
        subtitle: localizations.translate('onboarding_subtitle_4'),
        gradient: const [Color(0xFF059669), Color(0xFF047857)],
      ),
    ];

    return Scaffold(
      body: Stack(
        children: [
          // Page content
          PageView.builder(
            controller: _pageController,
            itemCount: pages.length,
            onPageChanged: (i) => setState(() => _currentPage = i),
            itemBuilder: (context, i) => _OnboardPageView(page: pages[i]),
          ),

          // Bottom controls overlay
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(32, 24, 32, 48),
              child: Column(
                children: [
                  // Dots
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(pages.length, (i) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        width: i == _currentPage ? 28 : 8,
                        height: 8,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(4),
                          color: Colors.white
                              .withValues(alpha: i == _currentPage ? 1.0 : 0.4),
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 32),

                  // Buttons row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Skip
                      TextButton(
                        onPressed: _finish,
                        child: TranslatedText(
                          localizations.translate('skip'),
                          style: GoogleFonts.outfit(
                            color: Colors.white.withValues(alpha: 0.7),
                            fontSize: 16,
                          ),
                        ),
                      ),

                      // Next / Get Started
                      ElevatedButton(
                        onPressed: () => _next(pages.length),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppTheme.primaryTeal,
                          padding: const EdgeInsets.symmetric(
                              horizontal: 32, vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50),
                          ),
                          elevation: 0,
                        ),
                        child: TranslatedText(
                          _currentPage == pages.length - 1
                              ? localizations.translate('get_started')
                              : localizations.translate('next'),
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _OnboardPage {
  final IconData icon;
  final String title;
  final String subtitle;
  final List<Color> gradient;

  const _OnboardPage({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.gradient,
  });
}

class _OnboardPageView extends StatefulWidget {
  final _OnboardPage page;
  const _OnboardPageView({required this.page});

  @override
  State<_OnboardPageView> createState() => _OnboardPageViewState();
}

class _OnboardPageViewState extends State<_OnboardPageView>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _fadeAnim;
  late Animation<double> _slideAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
        vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeIn);
    _slideAnim = Tween<double>(begin: 40, end: 0).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeOut),
    );
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: widget.page.gradient,
        ),
      ),
      child: SafeArea(
        child: AnimatedBuilder(
          animation: _ctrl,
          builder: (context, _) => Opacity(
            opacity: _fadeAnim.value,
            child: Transform.translate(
              offset: Offset(0, _slideAnim.value),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon circle
                  Container(
                    width: size.width * 0.45,
                    height: size.width * 0.45,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white.withValues(alpha: 0.12),
                      border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 1.5),
                    ),
                    child: Icon(
                      widget.page.icon,
                      size: size.width * 0.2,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 48),

                  // Title
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: TranslatedText(
                      widget.page.title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        height: 1.2,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Subtitle
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 40),
                    child: TranslatedText(
                      widget.page.subtitle,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        color: Colors.white.withValues(alpha: 0.8),
                        height: 1.5,
                      ),
                    ),
                  ),

                  // Space for bottom controls
                  const SizedBox(height: 180),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
