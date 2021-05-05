export enum ConditionValueType {
  SingleVariant = 'SingleVariant',
  MultiVariant = 'MultiVariant',
}

export enum DistributionType {
  weighted = 'weighted',
  bernoulliTrial = 'bernoulliTrial',
}

export type WeightedDistributionArg = {
  value: any;
  weight: number;
};

export type WeightedDistribution = {
  type: DistributionType.weighted;
  args: WeightedDistributionArg[];
};

export type BernoulliTrialDistribution = {
  type: DistributionType.bernoulliTrial;
  args: number;
};

export type ValueDistribution = WeightedDistribution | BernoulliTrialDistribution;

export type Matcher = Record<string, any>;

export type MultiValueRule = {
  Type: ConditionValueType.MultiVariant;
  Matcher: Matcher;
  OwnerType: string;
  ValueDistribution: ValueDistribution;
  Salt: string;
};

export type SingleValueRule = {
  Type: ConditionValueType.SingleVariant;
  Matcher: Matcher;
  Value: any;
  Salt?: string;
};

export type Rule = MultiValueRule | SingleValueRule;

export type Partition = { [partition: string]: JpadRules };

export type JpadRules = Partition | Rule[];

export type Jpad = {
  partitions: string[];
  valueType: string;
  rules: JpadRules;
  defaultValue?: any;
};
