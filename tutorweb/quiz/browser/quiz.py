from Products.CMFCore.utils import getToolByName
from Products.Five import BrowserView
from Products.Five.browser.pagetemplatefile import ViewPageTemplateFile


class QuizView(BrowserView):
    """
    Render quiz holding page
    """
    index = ViewPageTemplateFile("do-quiz.pt")

    def __call__(self):
        return self.render()

    def render(self):
        return self.index()

    def resourceUrl(self, urlFragment):
        """Add portal URL to fragment"""
        return getToolByName(self.context, 'portal_url')() + '/' + urlFragment


class QuizManifestView(QuizView):
    """
    Render a manifest of all resources the quiz requires
    """
    def resourceUrl(self, urlFragment):
        """Make a note of all URLs requested"""
        url = super(QuizManifestView, self).resourceUrl(urlFragment)
        if url.endswith('do-quiz.appcache'):
            # Don't make the manifest a resource of itself
            return url

        #TODO: More files, actually generate timestamp
        if url.rsplit('/',1)[-1] in ['quiz.js', 'quiz.css', 'logo.jpg']:
            url += '?timestamp=2013030101'
        self.requiredResources.append(url)
        return url

    def render(self):
        # Render template, which will add to resources it needs
        self.requiredResources = []
        template = super(QuizManifestView, self).render()

        # Turn resource list into manifest
        manifest = "CACHE MANIFEST\n\n"
        for r in self.requiredResources:
            manifest += r + "\n"

        # Allow access to API calls
        manifest += "\nNETWORK:\n"
        for r in [self.resourceUrl('quiz-')]:
            manifest += r + "\n"

        # Version that can be bumped if necessary
        manifest += "\n# v1\n"

        self.request.response.setHeader("Content-type", "text/cache-manifest")
        return manifest
