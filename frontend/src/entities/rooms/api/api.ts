"use server";

import { apiClient } from "@/shared/api/client";
import { getErrorMessage } from "@/shared/api/error";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import type { Room, RoomCreate, RoomUpdate } from "../model/types";

export interface GetRoomsParams {
  skip?: number;
  limit?: number;
}

export const getRooms = async (params: GetRoomsParams = {}): Promise<Room[]> => {
  const query: Record<string, number> = {};
  if (params.skip !== undefined) query.skip = params.skip;
  query.limit = params.limit !== undefined ? params.limit : 100;

  try {
    const { data, error } = await apiClient.GET("/api/v1/rooms/", {
      params: { query }
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data ?? [];
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const getRoom = async (room_id: number): Promise<Room> => {
  try {
    const { data, error } = await apiClient.GET("/api/v1/rooms/{room_id}", {
      params: { path: { room_id } },
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const createRoom = async (room: RoomCreate): Promise<Room> => {
  try {
    const { data, error } = await apiClient.POST("/api/v1/rooms/", {
      body: room,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const updateRoom = async (
  room_id: number,
  room: RoomUpdate
): Promise<Room> => {
  try {
    const { data, error } = await apiClient.PUT("/api/v1/rooms/{room_id}", {
      params: { path: { room_id } },
      body: room,
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    return data;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};

export const deleteRoom = async (room_id: number): Promise<void> => {
  try {
    const { error } = await apiClient.DELETE("/api/v1/rooms/{room_id}", {
      params: { path: { room_id } },
    });
    if (error) {
      throw new Error(getErrorMessage(error));
    }
  } catch (error) {
    if (isRedirectError(error)) throw error;
    throw new Error(getErrorMessage(error));
  }
};
