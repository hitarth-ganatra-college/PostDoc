export type GeneratePostPipelineInput = {
  userId: string;
  query: string;
};

export class GeneratePostPipeline {
  async run(_input: GeneratePostPipelineInput): Promise<void> {
    throw new Error("GeneratePostPipeline is not implemented yet.");
  }
}
