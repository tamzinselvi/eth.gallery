import { Http } from "@angular/http"
import { Injectable, Inject } from '@angular/core';

@Injectable()
export default class TaskService {
  constructor(@Inject(Http) private http) {}

  getTaskById(id: string) {
    return this.http.get(`/api/task/${id}`)
      .map(res => res.json())
  }

  createTask(taskData) {
    return this.http.post(`/api/task`, taskData)
      .map(res => res.json())
  }

  updateTask(id: string, taskData) {
    return this.http.put(`/api/task/${id}`, taskData)
      .map(res => res.json())
  }

  deleteTask(id: string) {
    return this.http.delete(`/api/task/${id}`)
      .map(res => res.json())
  }

  createTaskWithinTask(parentTaskId, taskData) {
    return this.http.post(`/api/task/${parentTaskId}`, taskData)
      .map(res => res.json())
  }
}
