import CodingProblem from '../models/CodingProblem.js';

export const createCodingProblem = async (req, res, next) => {
  try {
    const { title, description, problemStatement, difficulty, category, testCases, constraints, examples, tags, solution } = req.body;

    const codingProblem = new CodingProblem({
      title,
      description,
      problemStatement,
      difficulty,
      category,
      testCases,
      constraints,
      examples,
      tags,
      solution,
      createdBy: req.user.id,
    });

    await codingProblem.save();

    res.status(201).json({
      success: true,
      message: 'Coding problem created successfully',
      codingProblem,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCodingProblems = async (req, res, next) => {
  try {
    const { difficulty, category, tags } = req.query;
    let filter = { isPublished: true };

    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };

    const codingProblems = await CodingProblem.find(filter).populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      count: codingProblems.length,
      codingProblems,
    });
  } catch (error) {
    next(error);
  }
};

export const getCodingProblemById = async (req, res, next) => {
  try {
    const codingProblem = await CodingProblem.findById(req.params.id).populate('createdBy', 'name');

    if (!codingProblem) {
      return res.status(404).json({ message: 'Coding problem not found' });
    }

    res.status(200).json({
      success: true,
      codingProblem,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCodingProblem = async (req, res, next) => {
  try {
    let codingProblem = await CodingProblem.findById(req.params.id);

    if (!codingProblem) {
      return res.status(404).json({ message: 'Coding problem not found' });
    }

    if (codingProblem.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this problem' });
    }

    codingProblem = await CodingProblem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Coding problem updated successfully',
      codingProblem,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCodingProblem = async (req, res, next) => {
  try {
    const codingProblem = await CodingProblem.findById(req.params.id);

    if (!codingProblem) {
      return res.status(404).json({ message: 'Coding problem not found' });
    }

    if (codingProblem.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this problem' });
    }

    await CodingProblem.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Coding problem deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const publishCodingProblem = async (req, res, next) => {
  try {
    let codingProblem = await CodingProblem.findById(req.params.id);

    if (!codingProblem) {
      return res.status(404).json({ message: 'Coding problem not found' });
    }

    if (codingProblem.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to publish this problem' });
    }

    codingProblem = await CodingProblem.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Coding problem published successfully',
      codingProblem,
    });
  } catch (error) {
    next(error);
  }
};
