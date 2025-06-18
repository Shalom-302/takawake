/**
 * Service pour interagir avec l'API Test
 */

import axiosClient from '@/lib/api/axios-client'
import { AxiosResponse } from 'axios'

// Interface représentant une ressource Test
export interface Test {
  id: string
  name: string
  description?: string | null
  created_at: string
}

// Données nécessaires à la création d'une ressource Test
export interface CreateTestRequest {
  name: string
  description?: string | null
}

const testService = {
  /**
   * Récupère tous les tests
   */
  async getTests(): Promise<Test[]> {
    try {
      const response: AxiosResponse<Test[]> = await axiosClient.get('/tests')
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des tests:', error)
      throw error
    }
  },

  /**
   * Récupère un test par son ID
   */
  async getTestById(testId: string): Promise<Test> {
    try {
      const response: AxiosResponse<Test> = await axiosClient.get(`/tests/${testId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération du test ${testId}:`, error)
      throw error
    }
  },

  /**
   * Crée un nouveau test
   */
  async createTest(data: CreateTestRequest): Promise<Test> {
    try {
      const response: AxiosResponse<Test> = await axiosClient.post('/tests', data)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création du test:', error)
      throw error
    }
  },

  /**
   * Supprime un test
   */
  async deleteTest(testId: string): Promise<void> {
    try {
      await axiosClient.delete(`/tests/${testId}`)
    } catch (error) {
      console.error(`Erreur lors de la suppression du test ${testId}:`, error)
      throw error
    }
  },

  /**
   * Met à jour un test
   */
  async updateTest(testId: string, data: Partial<CreateTestRequest>): Promise<Test> {
    try {
      const response: AxiosResponse<Test> = await axiosClient.put(`/tests/${testId}`, data)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du test ${testId}:`, error)
      throw error
    }
  }
}

export default testService
