// Router links that cross pages with a view transition (a crossfade between the old and the new page) where the
// browser supports it; elsewhere they behave as plain links and the page's own enter animation does the work.
import { Link as RouterLink, NavLink as RouterNavLink, type LinkProps, type NavLinkProps } from 'react-router-dom';

export function Link(props: LinkProps) {
  return <RouterLink viewTransition {...props} />;
}
export function NavLink(props: NavLinkProps) {
  return <RouterNavLink viewTransition {...props} />;
}
