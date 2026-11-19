
# Reference: Runtime Portability

medra runs from the same instructions on Claude Code and on Antigravity, where it is installed as the plugin `medra`. Where the runtimes differ, these rules apply:

| Need | Claude Code | Antigravity | Any runtime without the tool |
|---|---|---|---|
| Invocable command | `/medra:<command>` slash command | `/medra:<command>` slash command | Read `.agents/plugins/medra/skills/<name>/SKILL.md` |
| Read templates, handoffs, pipelines | Read `.agents/plugins/medra/...` | `read_file` on `.agents/plugins/medra/...` | Read file directly |
| Ask a structured question | `AskUserQuestion`, at most 4 questions per call | `ask_question` | Numbered options in chat; wait for an explicit reply |
| Delegate to another agent | `Agent` tool, under the handoff contract the pipeline names | `invoke_subagent` with the agent the handoff names, under the same contract | Run the receiver's pipeline yourself, in a separate section headed with the receiver's name. Apply its constraints for the duration, then return to your own role with only its response fields. When a pipeline dispatches two receivers in parallel, run them one after the other |
| Command arguments | Given to the command skill | The text the user typed after the command | Same as Antigravity |
