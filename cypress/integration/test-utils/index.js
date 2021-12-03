const { getTitle } = require('../../../utils')
const OVERRIDES = require('../../fixtures/sidebar-overrides.json')

export const runSidebarTests = ([section]) => {
  describe(`${section.title} Pages`, () => {
    section.children.forEach((category) => {
      describe(`Collapsible - ${category.title}`, () => {
        beforeEach(() => {
          cy.viewport('macbook-15')
          cy.visit(`/${section.slug}`)

          // scroll category button into view and expand it if hidden
          cy.get('.app-sidebar')
            .contains(category.title)
            .then(($category) => {
              cy.get(`[data-test="${category.title}-children"]`).then(($ul) => {
                cy.wrap($category).scrollIntoView().click()
              })
            })
        })

        category.children.forEach((page) => {
          // The Sidebar Nav on the left on desktop - Main Navigation
          it(`Renders Page - ${page.title}`, () => {
            // click the page link in the sidebar
            cy.contains(
              `.app-sidebar [data-test="${category.slug}"] a`,
              page.title
            ).click({ force: true })

            const constructedPath = `/${section.slug}/${category.slug}/${page.slug}`
            const pathname = page.redirect || constructedPath
            const categorySlug = OVERRIDES.CATEGORY_SLUG[pathname] || category.slug
            const sidebarText = OVERRIDES.SIDEBAR_TEXT[pathname] || page.title
            const pageTitle = OVERRIDES.PAGE_TITLE[pathname] || page.title

            // ensure the correct page has been navigated to
            cy.location('pathname').should('equal', pathname)

            // ensure the current sidebar category contains an active link with the current page title
            cy.contains(
              `.app-sidebar [data-test="${categorySlug}"] a`,
              sidebarText
            ).should(
              'have.class',
              'active-sidebar-link'
            )

            // ensure only one link is active in the sidebar
            cy.get('.active-sidebar-link').should('have.length', 1)

            // ensure the page title and header are correct
            cy.title().should('equal', getTitle(pageTitle))
            cy.get('h1').contains(pageTitle)

            cy.visualSnapshot(constructedPath)
          })
        })
      })
    })
  })
}
