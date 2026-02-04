#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
🌙 Abjad Calculator for ADAN-ID OpenCloud
Classical Hisab al-Jummal integrated with Quranic Cloud Architecture
"""

class AbjadCalculator:
    def __init__(self):
        self.abjad_map = {
            'ا': 1, 'ب': 2, 'ج': 3, 'د': 4, 'ه': 5, 'و': 6, 'ز': 7, 'ح': 8, 'ط': 9, 'ي': 10,
            'ك': 20, 'ل': 30, 'م': 40, 'ن': 50, 'س': 60, 'ع': 70, 'ف': 80, 'ص': 90, 'ق': 100,
            'ر': 200, 'ش': 300, 'ت': 400, 'ث': 500, 'خ': 600, 'ذ': 700, 'ض': 800, 'ظ': 900, 'غ': 1000,
            'ى': 10, 'ة': 5, 'أ': 1, 'إ': 1, 'آ': 1, 'ؤ': 6, 'ئ': 10
        }
        self.diacritics = ['َ', 'ُ', 'ِ', 'ّ', 'ْ', 'ً', 'ٌ', 'ٍ', 'ٰ', 'ٓ', 'ٔ', 'ـ']
    
    def remove_diacritics(self, text: str) -> str:
        for mark in self.diacritics:
            text = text.replace(mark, '')
        return text.strip()
    
    def calculate(self, text: str) -> int:
        clean_text = self.remove_diacritics(text)
        return sum(self.abjad_map.get(char, 0) for char in clean_text)
    
    def validate_bismillah(self, text: str) -> bool:
        return self.calculate(text) == 786
