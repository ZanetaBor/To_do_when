Cypress.Commands.add('addTask', (title) => {
    cy.get('#addTaskInput').type(title);
    cy.get('.add-task-btn').click();
});

Cypress.Commands.add('removeTask', (taskTitle) => {
    cy.contains('.task-item', taskTitle)
        .click(); 

    cy.get('.remove-task-btn').click();
});

