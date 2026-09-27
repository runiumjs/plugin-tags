import {
  ProjectConfig,
  ProjectTaskConfig,
  ProjectTaskStartMode,
} from '@runium/types-plugin';

interface TaskWithTags extends ProjectTaskConfig {
  tags?: string[];
}

interface ProjectConfigWithTags extends ProjectConfig {
  tasks: TaskWithTags[];
}

/**
 * Process project tasks:
 * - tasks without tags are always kept as-is
 * - tasks with a matching tag are kept and their mode is cleared
 * - tasks without a matching tag are ignored
 * - dependencies of kept tasks are enabled even if they would otherwise be ignored
 */
export function processTasks(
  config: ProjectConfigWithTags,
  tags: string[]
): ProjectConfig {
  const tasks = new Map<string, TaskWithTags>();
  const activeTasks = new Set<string>();
  const uniqueTags = new Set(tags.map(String));

  for (const task of config.tasks) {
    tasks.set(task.id, task);
    const taskTags = task.tags ?? [];
    if (
      (taskTags.length === 0 || taskTags.some(tag => uniqueTags.has(tag))) &&
      task.mode !== ('ignore' as ProjectTaskStartMode)
    ) {
      activeTasks.add(task.id);
    }
  }

  // process transitive dependencies of active tasks
  function processDependencies(id: string): void {
    const task = tasks.get(id);
    if (!task?.dependencies) {
      return;
    }
    for (const dependency of task.dependencies) {
      if (!activeTasks.has(dependency.taskId) && tasks.has(dependency.taskId)) {
        activeTasks.add(dependency.taskId);
        processDependencies(dependency.taskId);
      }
    }
  }

  for (const id of [...activeTasks]) {
    processDependencies(id);
  }

  for (const task of config.tasks) {
    if (!activeTasks.has(task.id)) {
      task.mode = 'ignore' as ProjectTaskStartMode;
    }
  }

  return config;
}
