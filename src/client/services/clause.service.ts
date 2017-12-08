import { Http } from "@angular/http"
import { Injectable, Inject } from "@angular/core"

@Injectable()
export default class ClauseService {
  constructor(@Inject(Http) private http) {}

  getClauseById(id: string) {
    return this.http.get(`/api/clause/${id}`)
      .map(res => res.json())
  }

  getClauses() {
    return this.http.get("/api/clause")
      .map(res => res.json())
      .map(data => data.Items)
  }

  createTaskWithinClause(clauseId: string, taskData) {
    return this.http.post(`/api/clause/${clauseId}`, taskData)
      .map(res => res.json())
  }

  convertClauseToGraph(clause) {
    const start = {
      id: "start",
      name: "Start",
    }
    const end = {
      id: "end",
      name: "End",
    }
    const nodes = [start, end]
    const links = []

    function gatherNodeLinks(child, parent = null) {
      if (parent) {
        links.push({
          source: parent.id,
          target: child.id,
        })
      }
      else {
        links.push({
          source: "start",
          target: child.id,
        })
      }
      nodes.push({
        id: child.id,
        name: child.name,
      })
      if (child.subsequentTasks.length) {
        child.subsequentTasks.forEach(task => gatherNodeLinks(task, child))
      } else {
        links.push({
          source: child.id,
          target: "end",
        })
      }
    }

    if (clause.taskGroup.childTasks.length) {
      clause.taskGroup.childTasks.forEach(task => gatherNodeLinks(task))
    }
    else {
        links.push({
          source: "start",
          target: "end",
        })
    }

    return { nodes, links, start, end }
  }
}
