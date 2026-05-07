import albumData from './albums.json'

export type Album = {
  id: string
  title: string
  year: number
  subtitle?: string
  color: string
  cover: string
  songs: string[]
}

export type Song = {
  id: string
  title: string
  albumId: string
  albumTitle: string
  year: number
  color: string
}

export const albums: Album[] = albumData as Album[]

export const songs: Song[] = albums.flatMap((album) =>
  album.songs.map((title, index) => ({
    id: `${album.id}-${index}`,
    title,
    albumId: album.id,
    albumTitle: album.title,
    year: album.year,
    color: album.color,
  })),
)
