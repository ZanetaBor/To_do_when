describe('To-Do App Tests', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000'); 
    });

    it('1. Add a new task', () => {
        cy.addTask('New Task');
        cy.contains('New Task').should('exist');
    });

    it('2. Remove a task', () => {
        cy.addTask('Task to Remove');
        cy.removeTask('Task to Remove');
        cy.wait(500);
        cy.contains('Task to Remove').should('not.exist');
    });

    it('3. Verify task is saved in JSON file', () => {
        cy.addTask('Persisted Task');
        cy.readFile('tasks.json').then((tasks) => {
            const taskExists = tasks.some(task => task.title === 'Persisted Task');
            expect(taskExists).to.be.true; 
        });
    });

    it('4. Reload tasks after refreshing the page', () => {
        cy.addTask('Persistent Task');
        cy.reload();
        cy.contains('Persistent Task').should('exist');
    });

    it('5. Check if marking a task as completed works', () => {
        cy.addTask('Task to Complete');
        cy.contains('Task to Complete').parent().find('input[type="checkbox"]').check();
        cy.contains('Task to Complete').parent().find('input[type="checkbox"]').should('be.checked');
    });

    it('6. Check if unchecking a completed task works', () => {
        cy.addTask('Task to Uncheck');

      
        cy.contains('Task to Uncheck')
            .parent()
            .find('input[type="checkbox"]')
            .check();

        cy.contains('Task to Uncheck')
            .parent()
            .find('input[type="checkbox"]')
            .uncheck();


        cy.contains('Task to Uncheck')
            .parent()
            .find('input[type="checkbox"]')
            .should('not.be.checked');
    });

    it('7. Filter completed tasks', () => {
        cy.addTask('Completed Task');
        cy.contains('Completed Task').parent().find('input[type="checkbox"]').check();
        cy.get('.filter-tasks-btn').click();
        cy.contains('Completed Task').should('exist');
    });

    it('8. Sort tasks by date', () => {
        cy.addTask('Older Task');
        cy.wait(500);
        cy.addTask('Newer Task');
        cy.get('.sort-tasks-btn').click(); 
        cy.get('.list-items').children().first().contains('Newer Task');

    });

    it('9. Simulate delay in adding a task', () => {
        cy.addTask('Delayed Task');
        cy.wait(500); 
        cy.contains('Delayed Task').should('exist');
    });

    it('10. Handle async operations correctly', () => {
        cy.addTask('Async Task');
        cy.wait(1000); 
        cy.contains('Async Task').should('exist');
    });

    it('11. Test responsiveness', () => {
        cy.viewport(320, 480); 
        cy.visit('http://localhost:3000');
        cy.get('.task-item').should('be.visible');
    });
});
