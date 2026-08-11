import Aptitude from '../models/Aptitude.js';

export const createAptitude = async (req, res, next) => {
  try {
    const { title, description, questions, category, duration, totalQuestions, passingScore } = req.body;

    const aptitude = new Aptitude({
      title,
      description,
      questions,
      category,
      duration,
      totalQuestions,
      passingScore,
      createdBy: req.user.id,
    });

    await aptitude.save();

    res.status(201).json({
      success: true,
      message: 'Aptitude test created successfully',
      aptitude,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAptitudes = async (req, res, next) => {
  try {
    const aptitudes = await Aptitude.find({ isPublished: true }).populate('createdBy', 'name');
    res.status(200).json({
      success: true,
      count: aptitudes.length,
      aptitudes,
    });
  } catch (error) {
    next(error);
  }
};

export const getAptitudeById = async (req, res, next) => {
  try {
    const aptitude = await Aptitude.findById(req.params.id).populate('createdBy', 'name');

    if (!aptitude) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    res.status(200).json({
      success: true,
      aptitude,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAptitude = async (req, res, next) => {
  try {
    let aptitude = await Aptitude.findById(req.params.id);

    if (!aptitude) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    if (aptitude.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this test' });
    }

    aptitude = await Aptitude.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Aptitude test updated successfully',
      aptitude,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAptitude = async (req, res, next) => {
  try {
    const aptitude = await Aptitude.findById(req.params.id);

    if (!aptitude) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    if (aptitude.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this test' });
    }

    await Aptitude.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Aptitude test deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const publishAptitude = async (req, res, next) => {
  try {
    let aptitude = await Aptitude.findById(req.params.id);

    if (!aptitude) {
      return res.status(404).json({ message: 'Aptitude test not found' });
    }

    if (aptitude.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to publish this test' });
    }

    aptitude = await Aptitude.findByIdAndUpdate(
      req.params.id,
      { isPublished: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Aptitude test published successfully',
      aptitude,
    });
  } catch (error) {
    next(error);
  }
};
