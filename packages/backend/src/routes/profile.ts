import { Router, Request, Response } from 'express';
import UserProfile from '../models/UserProfile.js';

const router = Router();

// GET /api/profile - Buscar perfil do usuário
router.get('/', async (req: Request, res: Response) => {
  try {
    // Busca o primeiro (e único) perfil
    let profile = await UserProfile.findOne();

    if (!profile) {
      // Se não existir, retorna null (frontend pode usar DEFAULT_PROFILE)
      return res.json(null);
    }

    res.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// POST /api/profile - Criar ou atualizar perfil do usuário
router.post('/', async (req: Request, res: Response) => {
  try {
    const profileData = req.body;

    // Busca perfil existente
    let profile = await UserProfile.findOne();

    if (profile) {
      // Atualiza perfil existente
      Object.assign(profile, profileData);
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      // Cria novo perfil
      profile = new UserProfile({
        ...profileData,
        updatedAt: new Date(),
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Erro ao salvar perfil:', error);
    res.status(500).json({ error: 'Erro ao salvar perfil' });
  }
});

// PUT /api/profile - Atualizar perfil (mesmo comportamento do POST)
router.put('/', async (req: Request, res: Response) => {
  try {
    const profileData = req.body;

    let profile = await UserProfile.findOne();

    if (profile) {
      Object.assign(profile, profileData);
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      profile = new UserProfile({
        ...profileData,
        updatedAt: new Date(),
      });
      await profile.save();
    }

    res.json(profile);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;




