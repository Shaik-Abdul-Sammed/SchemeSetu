const express = require('express');
const router = express.Router();
const schemesData = require('../data/schemesData');

// GET /api/v1/schemes - Search, Filter, Sort & Paginate Schemes
router.get('/', (req, res) => {
  try {
    let {
      q,
      search,
      category,
      level,
      beneficiary,
      gender,
      occupation,
      sector,
      state,
      maxIncome,
      age,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    let filtered = [...schemesData];

    const searchTerm = (q || search || '').trim().toLowerCase();
    if (searchTerm !== '') {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchTerm) ||
        s.shortName.toLowerCase().includes(searchTerm) ||
        s.summary.toLowerCase().includes(searchTerm) ||
        s.department.toLowerCase().includes(searchTerm) ||
        s.category.toLowerCase().includes(searchTerm) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(searchTerm)))
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }

    if (level && level !== 'All') {
      filtered = filtered.filter(s => s.level.toLowerCase() === level.toLowerCase());
    }

    if (beneficiary && beneficiary !== 'All') {
      filtered = filtered.filter(s => s.beneficiary.toLowerCase().includes(beneficiary.toLowerCase()));
    }

    if (gender && gender !== 'All') {
      filtered = filtered.filter(s => s.gender === 'All' || s.gender.toLowerCase() === gender.toLowerCase());
    }

    if (occupation && occupation !== 'All') {
      filtered = filtered.filter(s => s.occupation === 'Any' || s.occupation.toLowerCase() === occupation.toLowerCase());
    }

    if (sector && sector !== 'All') {
      filtered = filtered.filter(s => s.sector.toLowerCase() === sector.toLowerCase());
    }

    if (state && state !== 'All') {
      filtered = filtered.filter(s => s.state === 'Pan-India' || s.state.toLowerCase() === state.toLowerCase());
    }

    if (maxIncome) {
      const incomeNum = Number(maxIncome);
      if (!isNaN(incomeNum)) {
        filtered = filtered.filter(s => incomeNum <= s.maxIncome);
      }
    }

    if (age) {
      const ageNum = Number(age);
      if (!isNaN(ageNum)) {
        filtered = filtered.filter(s => ageNum >= s.minAge && ageNum <= s.maxAge);
      }
    }

    if (sort === 'name_asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'name_desc') {
      filtered.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'income_asc') {
      filtered.sort((a, b) => a.maxIncome - b.maxIncome);
    } else if (sort === 'income_desc') {
      filtered.sort((a, b) => b.maxIncome - a.maxIncome);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = pageNum * limitNum;
    const paginatedData = filtered.slice(startIndex, endIndex);

    return res.status(200).json({
      success: true,
      count: paginatedData.length,
      total: filtered.length,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / limitNum) || 1,
      schemes: paginatedData,
      data: paginatedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limitNum) || 1
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error while fetching schemes.",
      message: error.message
    });
  }
});

// GET /api/v1/schemes/categories - Category counts
router.get('/categories', (req, res) => {
  try {
    const categoriesMap = {};
    schemesData.forEach(s => {
      categoriesMap[s.category] = (categoriesMap[s.category] || 0) + 1;
    });

    const categories = Object.keys(categoriesMap).map(cat => ({
      name: cat,
      count: categoriesMap[cat]
    }));

    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/schemes/recommend - Recommendation Endpoint
router.post('/recommend', (req, res) => {
  try {
    const { projectType, cost, income, education, location, age = 30, occupation = 'Farmer' } = req.body || {};

    const evaluated = schemesData.map(scheme => {
      let score = 70;
      if (income && Number(income) <= scheme.maxIncome) score += 15;
      if (occupation && scheme.occupation.toLowerCase() === occupation.toLowerCase()) score += 15;
      return {
        ...scheme,
        matchScore: Math.min(100, score)
      };
    });

    evaluated.sort((a, b) => b.matchScore - a.matchScore);
    const top3 = evaluated.slice(0, 3);

    return res.status(200).json({
      success: true,
      recommendations: top3,
      totalEligible: evaluated.length,
      message: 'Eligible schemes found successfully'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/schemes/:id - Single scheme details
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const scheme = schemesData.find(s => String(s.id).toLowerCase() === String(id).toLowerCase());

    if (!scheme) {
      return res.status(404).json({
        success: false,
        error: `Scheme with ID '${id}' not found.`
      });
    }

    return res.status(200).json({
      success: true,
      ...scheme,
      data: scheme
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
