function Icon({ name, size = 20, className = "" }) {
 const common={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",className};
 const paths={
  search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  menu:<><path d="M4 6h16M4 12h16M4 18h16"/></>,
  logout:<><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M21 19V5a2 2 0 0 0-2-2h-5"/></>,
  code:<><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/><path d="m14 4-4 16"/></>,
  users:<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  terminal:<><path d="m4 17 6-5-6-5"/><path d="M12 19h8"/></>,
  grid:<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>,
  check:<><path d="m5 12 4 4L19 6"/></>,
  alert:<><path d="M10.3 2.9 1.8 17a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/></>,
  activity:<><path d="M3 12h4l3-8 4 16 3-8h4"/></>,
  spark:<><path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z"/></>,
  plus:<><path d="M12 5v14M5 12h14"/></>,
  user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  chevron:<path d="m6 9 6 6 6-6"/>
 };
 return <svg {...common}>{paths[name]||paths.activity}</svg>;
}
export default Icon;
