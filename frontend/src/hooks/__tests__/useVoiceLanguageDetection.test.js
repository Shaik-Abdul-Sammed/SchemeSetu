import { describe, it, expect } from 'vitest';
import { detectLanguageFromScript } from '../useVoiceLanguageDetection';

describe('useVoiceLanguageDetection - detectLanguageFromScript', () => {
  it('Devanagari returns hi', () => {
    expect(detectLanguageFromScript('नमस्ते मुझे योजना चाहिए').toLowerCase()).toBe('hi');
  });

  it('Telugu returns te', () => {
    expect(detectLanguageFromScript('నమస్కారం నాకు స్వయం ఉపాధి లోన్ కావాలి').toLowerCase()).toBe('te');
  });

  it('Tamil returns ta', () => {
    expect(detectLanguageFromScript('வணக்கம் எனக்கு கடன் உதவி வேண்டும்').toLowerCase()).toBe('ta');
  });

  it('Kannada returns kn', () => {
    expect(detectLanguageFromScript('ನಮಸ್ಕಾರ ನನಗೆ ಯೋಜನೆ ಮಾಹಿತಿ ಬೇಕು').toLowerCase()).toBe('kn');
  });

  it('Malayalam returns ml', () => {
    expect(detectLanguageFromScript('നമസ്കാരം എനിക്ക് പദ്ധതി സഹായം വേണം').toLowerCase()).toBe('ml');
  });

  it('Bengali returns bn', () => {
    expect(detectLanguageFromScript('নমস্কার আমি ঋণ পেতে চাই').toLowerCase()).toBe('bn');
  });

  it('Gujarati returns gu', () => {
    expect(detectLanguageFromScript('નમસ્તે મને લોન સહાય જોઈએ છે').toLowerCase()).toBe('gu');
  });

  it('Punjabi returns pa', () => {
    expect(detectLanguageFromScript('ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਮੈਨੂੰ ਲੋਨ ਚਾਹੀਦਾ ਹੈ').toLowerCase()).toBe('pa');
  });

  it('Odia returns or', () => {
    expect(detectLanguageFromScript('ନମସ୍କାର ମୋତେ ଯୋଜନା ବିଷୟରେ ଜଣାନ୍ତୁ').toLowerCase()).toBe('or');
  });

  it('Latin returns en', () => {
    expect(detectLanguageFromScript('Hello I need a micro finance business loan').toLowerCase()).toBe('en');
  });

  it('Empty returns en', () => {
    expect(detectLanguageFromScript('').toLowerCase()).toBe('en');
    expect(detectLanguageFromScript(null).toLowerCase()).toBe('en');
  });

  it('Mixed script returns majority', () => {
    // 30 Telugu characters + 5 Latin characters -> Telugu majority
    const mixed = 'నమస్కారం నాకు స్వయం ఉపాధి లోన్ కావాలి Scheme';
    expect(detectLanguageFromScript(mixed).toLowerCase()).toBe('te');
  });
});
