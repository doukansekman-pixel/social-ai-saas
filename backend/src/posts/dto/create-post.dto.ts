export class CreatePostDto {
  dealerId: string;

  title: string;
  caption: string;
  hashtags: string;
  offer: string;

  designBrief?: string;
}
