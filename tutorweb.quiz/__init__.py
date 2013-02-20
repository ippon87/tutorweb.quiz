import os

from dogpile.cache.region import make_region
from pyramid.config import Configurator
from pyramid.session import UnencryptedCookieSessionFactoryConfig
from sqlalchemy import engine_from_config

from .site.models import DBSession


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    engine = engine_from_config(settings, 'sqlalchemy.')
    DBSession.configure(bind=engine)

    config = Configurator(settings=settings)
    config.include('pyramid_mailer')
    config.include('pyramid_jinja2')
    config.include('.site')
    config.scan()

    config.add_translation_dirs('tutorweb.quiz:locale/')

    # setup cookie session
    cookie_session_secret = ''.join('%02x' % ord(x) for x in os.urandom(16))
    my_session_factory = UnencryptedCookieSessionFactoryConfig(cookie_session_secret)
    config.set_session_factory(my_session_factory)

    # dogpile.cache configuration
    memory_region = make_region().configure_from_config(settings, "cache.memory.")
    config.set_request_property(lambda r: memory_region, name="cache_region_memory", reify=True)

    return config.make_wsgi_app()
