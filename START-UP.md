  
When not familiar with the codebase and the project:  
1. Read VISION, VISUALISATION, PIPELINE, USER_STORIES, FEATURE_LIST to understand what we are building 
2. Then read and understand the codebase to see where we are with the development progress  
3. Check USER_STORIES.md to understand the userstories, see what is implemented and how it is enabled with the specific features from the FEATURE_LIST.md. If the USER_STORIES.md  doesn’t exist - create one based on the PLAN.md  User stories must be connected to the features in the FEATURE_LIST.md and indicating whether they are implemented. Don’t write code - just plain english.  
4. Check FEATURE_LIST.md. If it doesn’t exist - create one based on the codebase and PLAN.md.  Features must have the completion indicator and where they exist (name of the file and line numbers), for those features already implemented. Don’t write code - just plain english.  
5. Then read GL-RDD.md, GL-TDD.md, GL-ERROR-LOGGING - the development principles that you must follow  
6. Then check PIPELINE.md to understand rules and guidelines to follow when developing the project. 
7. Then check ARCHITECTURE.md If it doesn’t exist - use appropriate agent to create target state ARCHITECTURE of the application using charts and other necessary visual elements. Plain english, no code.  
8. Then check the PROJECT_ROADMAP.md which is the implementation plan for the features from MVP to the target state with the completion indication. If it doesn’t exist - create it and populate it based on the learnings from the previous steps.  Don’t write code - just plain english.  
9. Then check progress, the PROGRESS.md is the list of the SPRINTS. These are individual “sprint” plans (SP). If the file doesn’t exist - create it and leave empty.  
10. The folder structure for the main documentation files above should be:  
    1. 00_PLAN (folder): PIPELINE, USER_STORIES, FEATURE_LIST, VISION
    2. 00_IMPLEMENTATION(folder): GL-RDD, GL-TDD, GL-ERROR-LOGGING, PROJECT_ROADMAP, PROGRESS, SPRINTS (folder): SP-files  
  
When working on the project:  
11. Follow closely GL-RDD.md, GL-ERROR-LOGGING.md  GL-TDD.md  
12. Before building any feature - check  PROJECT_ROADMAP.md, then create the sprint plan in the 00_IMPLEMENTATION >> SPRINTS folder, name it in the following way “SP_ID_what is being done.md”, for example if the sprint is about PostgreSQL to Supabase migration and it it sprint number 5 in the roadmap, you name it “SP_005_PostgreSQL_to_Supabase_migration.md“ -  
   13. This sprint plan should exactly describe what you are going to implement in plain english and without code. Use charts or illustrations where necessary.  
   14. After creating the SP- file list it in the PROGRESS. md (only condensed description of the Sprint needs to be included)  
   15. After having implemented the SP update the PROGRESS.md PROJECT_ROADMAP.md FEATURE_LIST.md and USER_STORIES.md. Use appropriate agent.  
   16. If the work on the sprint will produce more than 1 file - create a “SP_ID_what is being done” folder under SPRINTS folder and put all files there  
17. Aways follow test driven development  
18. For complex multi-step problems, use the sequential_thinking MCP tool to break down and analyze the task systematically  
19. Use appropriate agents and MCP servers  
  
  
  
# MCP Server Usage Guidelines  
  
  
- USE SUBAGENTS FOR MCP CALLS  
- **Combine multiple MCPs** for complex tasks (e.g., use Playwright to test a Neo4j-powered app)  
- **Use Context 7 first** when working with popular frameworks to get current documentation  
- **Specify browser and device** for Playwright when testing responsive designs